import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';

export const fetchLiveInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await inventoryService.getLatestInventory();

    res.status(200).json({
      success: true,
      data: {
        totalBricks: inventory.totalBricks,
        availableTrolleys: inventory.availableTrolleys,
        updatedAt: inventory.updatedAt || inventory.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
