export default class UserDTO {
    constructor(user) {
        this._id        = user._id;
        this.first_name = user.first_name;
        this.last_name  = user.last_name;
        this.email      = user.email;
        this.role       = user.role;
        this.pets       = user.pets;
        this.documents  = user.documents;
        this.last_connection = user.last_connection;
    }
}
