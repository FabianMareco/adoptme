import AdoptionModel from './models/Adoption.js';

export default class AdoptionsDao {
    getAll  = ()   => AdoptionModel.find().populate('owner pet');
    getById = (id) => AdoptionModel.findById(id).populate('owner pet');
    create  = (data) => AdoptionModel.create(data);
    delete  = (id)   => AdoptionModel.findByIdAndDelete(id);
}
