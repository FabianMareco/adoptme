export default class PetDTO {
    constructor(pet) {
        this._id       = pet._id;
        this.name      = pet.name;
        this.specie    = pet.specie;
        this.birthDate = pet.birthDate;
        this.adopted   = pet.adopted;
        this.owner     = pet.owner;
        this.image     = pet.image;
    }
}
