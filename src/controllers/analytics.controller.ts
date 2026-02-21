import { NextFunction, Request, Response } from 'express';
import Analytics, { AnalyticsMetricType } from '../models/Analytics';
import Order from '../models/Order';
import Enquiry from '../models/Enquiry';

const METRIC_TYPES: AnalyticsMetricType[] = [
  'whatsapp_click',
  'call_click',
  'order_click',
  'calculator_use',
];

const isMetricType = (value: unknown): value is AnalyticsMetricType => {
  return typeof value === 'string' && METRIC_TYPES.includes(value as AnalyticsMetricType);
};

export const trackAnalyticsMetric = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { metricType } = req.body || {};

    if (!isMetricType(metricType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid metric type',
      });
      return;
    }

    // Atomically increment the metric count with upsert
    // If doc doesn't exist, create with count: 1
    // If doc exists, increment count by 1
    const updatedMetric = await Analytics.findOneAndUpdate(
      { metricType },
      {
        $inc: { count: 1 },
        $set: { lastUpdated: new Date() },
      },
      {
        new: true,
        upsert: true,
        // On insert, MongoDB will first set the filter fields, then apply operators
        // So the initial doc will have metricType from filter + count: 1 from $inc
      }
    ).lean();

    res.status(200).json({
      success: true,
      data: {
        metricType,
        count: (updatedMetric as any)?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPeakEnquiryTime = async (): Promise<'Morning' | 'Afternoon' | 'Evening' | 'N/A'> => {
  const buckets = await Enquiry.aggregate([
    {
      $project: {
        bucket: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, 5] },
                    { $lt: [{ $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, 12] },
                  ],
                },
                then: 'Morning',
              },
              {
                case: {
                  $and: [
                    { $gte: [{ $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, 12] },
                    { $lt: [{ $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, 17] },
                  ],
                },
                then: 'Afternoon',
              },
            ],
            default: 'Evening',
          },
        },
      },
    },
    {
      $group: {
        _id: '$bucket',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  if (!buckets.length) {
    return 'N/A';
  }

  return buckets[0]._id;
};

export const getAdminAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const metricDocs = await Analytics.find({ metricType: { $in: METRIC_TYPES } })
      .select('metricType count')
      .lean();

    const metricMap = metricDocs.reduce<Record<string, number>>((acc, metric) => {
      acc[metric.metricType] = Math.max(0, metric.count || 0);
      return acc;
    }, {});

    const [
      mostOrderedProductResult,
      averageOrderResult,
      totalEnquiries,
      confirmedOrders,
      peakEnquiryTime,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$brickType',
            totalQuantity: { $sum: '$quantity' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 1 },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            avgBricks: { $avg: '$quantity' },
          },
        },
      ]),
      Enquiry.countDocuments(),
      Order.countDocuments({ status: { $in: ['confirmed', 'dispatched', 'delivered'] } }),
      getPeakEnquiryTime(),
    ]);

    const avgBricks = averageOrderResult[0]?.avgBricks || 0;
    const avgTrolleys = avgBricks / 3000;
    const conversionRate = totalEnquiries > 0 ? (confirmedOrders / totalEnquiries) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        interactions: {
          whatsappClicks: metricMap.whatsapp_click || 0,
          callClicks: metricMap.call_click || 0,
          orderClicks: metricMap.order_click || 0,
          calculatorUses: metricMap.calculator_use || 0,
        },
        business: {
          mostOrderedProduct: mostOrderedProductResult[0]
            ? {
                name: mostOrderedProductResult[0]._id,
                totalBricks: mostOrderedProductResult[0].totalQuantity,
                totalOrders: mostOrderedProductResult[0].orderCount,
              }
            : {
                name: 'N/A',
                totalBricks: 0,
                totalOrders: 0,
              },
          averageOrderSize: {
            bricks: Number(avgBricks.toFixed(2)),
            trolleys: Number(avgTrolleys.toFixed(2)),
          },
          peakEnquiryTime,
          conversionRate: Number(conversionRate.toFixed(2)),
          totals: {
            enquiries: totalEnquiries,
            confirmedOrders,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
