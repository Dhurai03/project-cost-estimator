const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['labor', 'materials', 'overhead', 'software', 'shipping', 'insurance'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    description: String,
    totalEstimate: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected', 'completed'],
        default: 'draft'
    },
    hours: Number,
    deliveryTime: Number,
    paymentMethod: String,
    shippingType: String,
    taxes: {
        type: Number,
        default: 0
    },
    insurance: {
        type: Boolean,
        default: false
    },
    additionalFees: {
        type: Number,
        default: 0
    },
    lineItems: [LineItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);