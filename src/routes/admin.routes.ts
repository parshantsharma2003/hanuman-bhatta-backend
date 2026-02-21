import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  updateProductPricing,
  updateInventory,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
  getDashboardStats,
  getActivityLogs,
} from '../controllers/admin.controller';
import {
  uploadGalleryMedia,
  getAllGalleryAdmin,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller';
import {
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  restoreProduct,
} from '../controllers/product.controller';

const router = Router();

router.use(authenticate);

// Dashboard Statistics
router.get('/stats', authorizeRoles('super_admin', 'admin'), getDashboardStats);

// Product Management (Full CRUD)
router.get('/products', authorizeRoles('super_admin', 'admin'), getAllProductsAdmin);
router.get('/products/:id', authorizeRoles('super_admin', 'admin'), getProductById);
router.post('/products', authorizeRoles('super_admin', 'admin'), createProduct);
router.put('/products/:id', authorizeRoles('super_admin', 'admin'), updateProduct);
router.patch('/products/:id/toggle-active', authorizeRoles('super_admin', 'admin'), toggleProductActive);
router.patch('/products/:id/restore', authorizeRoles('super_admin', 'admin'), restoreProduct);
router.delete('/products/:id', authorizeRoles('super_admin', 'admin'), deleteProduct);

// Legacy product pricing route (for backward compatibility)
router.put('/products/:id/pricing', authorizeRoles('super_admin', 'admin'), updateProductPricing);

// Inventory Management
router.put('/inventory', authorizeRoles('super_admin', 'admin'), updateInventory);

// Activity Log (Audit Trail)
router.get('/activity-logs', authorizeRoles('super_admin', 'admin'), getActivityLogs);

// Enquiry Management
router.get('/enquiries', authorizeRoles('super_admin', 'admin'), getEnquiries);
router.put('/enquiries/:id', authorizeRoles('super_admin', 'admin'), updateEnquiry);
router.delete('/enquiries/:id', authorizeRoles('super_admin'), deleteEnquiry);

// Gallery Management
router.post('/gallery', authorizeRoles('super_admin', 'admin'), uploadGalleryMedia);
router.get('/gallery', authorizeRoles('super_admin', 'admin'), getAllGalleryAdmin);
router.put('/gallery/:id', authorizeRoles('super_admin', 'admin'), updateGalleryItem);
router.delete('/gallery/:id', authorizeRoles('super_admin', 'admin'), deleteGalleryItem);

router.get('/ping', authorizeRoles('super_admin', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin route access granted',
    user: req.user,
  });
});

export default router;
