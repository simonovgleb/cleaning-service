const Router = require('express').Router;
const router = new Router();

router.use("/admins", require("./adminRoutes"));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/customers', require('./customerRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/feedbacks', require('./feedbackRoutes'));
router.use('/schedules', require('./scheduleRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/payments', require('./paymentRoutes'));

module.exports = router;