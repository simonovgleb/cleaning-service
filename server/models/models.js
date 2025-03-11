const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('../db');

// Admin Model
const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 50],
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Customer Model
const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 50],
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9\-+() ]+$/i,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Employee Model
const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 50],
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9\-+() ]+$/i,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Employee',
    },
}, {
    timestamps: true,
});

// Service Model
const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 100],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true,
            min: 0,
        },
    },
    duration: { // in minutes
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 15,
        },
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Appointment Model
const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString(),
        },
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Scheduled',
    },
}, {
    timestamps: true,
});

// Schedule Model
const Schedule = sequelize.define('Schedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    dayOfWeek: { // 0 (Sunday) - 6 (Saturday)
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 6,
        },
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Payment Model
const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true,
            min: 0,
        },
    },
    paymentMethod: {
        type: DataTypes.ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending',
    },
}, {
    timestamps: true,
});

// Feedback Model
const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 1000],
        },
    },
}, {
    timestamps: true,
});

// Appointment <-> Feedback
Appointment.hasMany(Feedback, {
    foreignKey: {
      name: 'appointmentId',
      allowNull: false, // Можно сделать true, если хотите разрешить feedback без appointment
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  Feedback.belongsTo(Appointment, {
    foreignKey: {
      name: 'appointmentId',
      allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
// Associations

// Customer <-> Appointment
Customer.hasMany(Appointment, {
    foreignKey: {
        name: 'customerId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Customer, {
    foreignKey: {
        name: 'customerId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Employee <-> Appointment
Employee.hasMany(Appointment, {
    foreignKey: {
        name: 'employeeId',
        allowNull: true, // Может быть назначен позже
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Employee, {
    foreignKey: {
        name: 'employeeId',
        allowNull: true,
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});

// Service <-> Appointment
Service.hasMany(Appointment, {
    foreignKey: {
        name: 'serviceId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Service, {
    foreignKey: {
        name: 'serviceId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Employee <-> Schedule
Employee.hasMany(Schedule, {
    foreignKey: {
        name: 'employeeId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Schedule.belongsTo(Employee, {
    foreignKey: {
        name: 'employeeId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Appointment <-> Payment
Appointment.hasOne(Payment, {
    foreignKey: {
        name: 'appointmentId',
        allowNull: false,
        unique: true,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Payment.belongsTo(Appointment, {
    foreignKey: {
        name: 'appointmentId',
        allowNull: false,
        unique: true,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Customer <-> Feedback
Customer.hasMany(Feedback, {
    foreignKey: {
        name: 'customerId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Feedback.belongsTo(Customer, {
    foreignKey: {
        name: 'customerId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Employee <-> Feedback
Employee.hasMany(Feedback, {
    foreignKey: {
        name: 'employeeId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Feedback.belongsTo(Employee, {
    foreignKey: {
        name: 'employeeId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Admin может просматривать все модели, дополнительных связей не требуется

module.exports = {
    sequelize,
    Admin,
    Customer,
    Employee,
    Service,
    Appointment,
    Schedule,
    Payment,
    Feedback,
};
