import {Task } from "../modele/task.modele";
import {CategorieModele} from "../modele/categorie.modele";
export class TaskService{
  categories : CategorieModele[];
  getAllCategories(){
    if(localStorage.categories != null){
      return JSON.parse(localStorage.categories);
    }
    return null;
  }
  /*
   * la première catégorie est la catégorie single Tasks.
   *ajout d'une nouvelle catégorie.
   */
  addNewCategorie(newCategorie : CategorieModele) {
    try{
      if (localStorage.categories == null){
        let categorie = new CategorieModele(0,"SingleTasks");
        this.categories= [categorie];
        this.categories.push(newCategorie);
        localStorage.setItem("categories",JSON.stringify(this.categories));
      }else{
        this.categories = JSON.parse(localStorage.categories);
        this.categories.push(newCategorie);
        localStorage.categories = JSON.stringify(this.categories);
      }
    }catch (error) {
      console.log("error add categorie",error)
    }
  }

  //ajout d'une nouvelle tache a une catégorie.
  addNewTaskToCategorie(idCategorie : number,task: Task) {
    try{
      this.categories = JSON.parse(localStorage.categories);
      this.categories[idCategorie].tasks.push(task);
      localStorage.categories = JSON.stringify(this.categories);
    }catch (error) {
      console.log("task not add to categorie ",idCategorie, " ",error);
    }
  }

  updateTask(idCategorie: number, idTask: number, task : Task) {
    try {
      this.categories = JSON.parse(localStorage.categories);
      this.categories[idCategorie].tasks[idTask] = task;
      localStorage.categories = JSON.stringify(this.categories);
    }catch (error) {
      console.log("error in update task ",idTask, " caused by: ",error);
    }
  }

  deleteTask(idCategorie: number, idTask: number) {
    try {
      this.categories = JSON.parse(localStorage.categories);
      this.categories[idCategorie].tasks.splice(idTask,1);
      localStorage.categories = JSON.stringify(this.categories);
    }catch (error) {
      console.log("error in delete task ",idTask, " caused by: ",error);
    }
  }
}
