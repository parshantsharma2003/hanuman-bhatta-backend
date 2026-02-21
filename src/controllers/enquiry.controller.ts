import { Request, Response, NextFunction } from 'express';
import * as enquiryService from '../services/enquiry.service';
import { AppError } from '../middleware/errorHandler';

const isValidPhone = (phone: string) => {
  return /^[0-9+\-\s()]{10,20}$/.test(phone);
};

export const submitEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, message } = req.body || {};

    if (!name || !phone || !message) {
      throw new AppError('Name, phone, and message are required', 400);
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }

    if (typeof message !== 'string' || message.trim().length < 10) {
      throw new AppError('Message must be at least 10 characters', 400);
    }

    if (typeof phone !== 'string' || !isValidPhone(phone)) {
      throw new AppError('Phone number is invalid', 400);
    }

    const enquiry = await enquiryService.createEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};
