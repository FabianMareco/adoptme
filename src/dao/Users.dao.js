import UserModel from './models/User.js';

export default class UsersDao {
    getAll  = ()           => UserModel.find();
    getById = (id)         => UserModel.findById(id);
    getBy   = (params)     => UserModel.findOne(params);
    create  = (data)       => UserModel.create(data);
    update  = (id, data)   => UserModel.findByIdAndUpdate(id, data, { new: true });
    delete  = (id)         => UserModel.findByIdAndDelete(id);
}
