import {Task} from "./task.modele";

export class CategorieModele {
  id : number;
  categorieName : string;
  tasks : Task[];
  constructor(id_cat : number, categorie_name : string) {
    this.id = id_cat;
    this.categorieName = categorie_name;
    this.tasks = [];
  }
}
