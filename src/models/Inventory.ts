import { Schema, model, models } from 'mongoose';

export interface InventoryDocument {
  _id?: any;
  totalBricks: number;
  availableTrolleys: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    totalBricks: {
      type: Number,
      required: [true, 'Total bricks count is required'],
      min: [0, 'Total bricks cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Total bricks must be a whole number',
      },
    },
    availableTrolleys: {
      type: Number,
      required: [true, 'Available trolleys count is required'],
      min: [0, 'Available trolleys cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Available trolleys must be a whole number',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = models.Inventory || model<InventoryDocument>('Inventory', InventorySchema);

export default Inventory;
