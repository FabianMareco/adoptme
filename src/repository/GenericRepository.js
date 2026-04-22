export default class GenericRepository {
    constructor(dao) { this.dao = dao; }
    getAll  = ()         => this.dao.getAll();
    getById = (id)       => this.dao.getById(id);
    getBy   = (params)   => this.dao.getBy(params);
    create  = (data)     => this.dao.create(data);
    update  = (id, data) => this.dao.update(id, data);
    delete  = (id)       => this.dao.delete(id);
}
