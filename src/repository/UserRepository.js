import GenericRepository from './GenericRepository.js';

export default class UserRepository extends GenericRepository {
    constructor(dao) { super(dao); }
    getUserByEmail = (email) => this.dao.getBy({ email });
}
