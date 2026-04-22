import PetModel from './models/Pet.js';

export default class PetsDao {
    getAll  = ()           => PetModel.find();
    getById = (id)         => PetModel.findById(id);
    getBy   = (params)     => PetModel.findOne(params);
    create  = (data)       => PetModel.create(data);
    update  = (id, data)   => PetModel.findByIdAndUpdate(id, data, { new: true });
    delete  = (id)         => PetModel.findByIdAndDelete(id);
}
