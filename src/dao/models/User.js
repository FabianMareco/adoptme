import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    reference: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    first_name:      { type: String, required: true },
    last_name:       { type: String, required: true },
    email:           { type: String, required: true, unique: true },
    password:        { type: String, required: true },
    role:            { type: String, enum: ['user', 'admin'], default: 'user' },
    pets:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
    documents:       [documentSchema],
    last_connection: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
