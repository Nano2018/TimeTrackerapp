import { Component,Input,OnInit } from '@angular/core';
import {TaskService} from "./services/task.service";
import {CategorieModele} from "./modele/categorie.modele";
import {Task } from "./modele/task.modele";
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{

  categories : CategorieModele[];

  numberCategories : number;

  displayCategorie : boolean[];

  displayAddTaskCategorie : boolean[];

  isEditTaskCategorie : {[id : number] : boolean[]} = {};
  /*
    Un dictionnaire de subscription, qui pour chaque tâche initialise une subscription,
    sous condition que toutes les tâches soient distincts.
   */
  subscriptions : {[id:string] : Subscription} = {};

  //pour afficher toutes les tâches.
  isClickedTaskAll = false;

  isAddNewCategorieClicked = false;

  isClickedSingleTask = false;

  /*
   *ne pas éditer la tâche, si aucune catégorie n'a été séléctionnée.
   */
  wrongCategorySelected = false;

  visualiseHistoriqueTask : {[id : number] : boolean[]} = {};
  @Input() projectName : string;
  @Input() taskName : string;
  @Input() categorieSelected : string;
  date_debut : Date;
  historiques :{[id:string]: Duree[]} = {};
  constructor(private taskService : TaskService) {
  }
  ngOnInit() {
    //initialisation;
    //récupérer la liste des catégories dans le locale storage.
    this.categories = this.taskService.getAllCategories();
    if(!this.categories){
      this.categories = [new CategorieModele(0,"SingleTasks")];
    }

    //initalisation des attributs.
    this.refrech();
  }
  refrech(){
    this.displayCategorie = [];
    this.displayAddTaskCategorie = [];
    this.isEditTaskCategorie = {};
    this.numberCategories = this.categories.length;

    //masquer les éléments inutiles dans le template.
    for (let i = 0; i < this.numberCategories; i++) {
      this.displayCategorie.push(false);
      this.displayAddTaskCategorie.push(false);
      this.isEditTaskCategorie[i] = [];
      this.visualiseHistoriqueTask[i] = [];
      this.categories[i].tasks.forEach(element => {
        this.isEditTaskCategorie[i].push(false);
        this.visualiseHistoriqueTask[i].push(false);
      });
    }
  }

  /*
    display all tasks.
   */
  onAllTasks(){
    this.isClickedTaskAll = !this.isClickedTaskAll;
    console.log("click all tasks",this.isAddNewCategorieClicked);
  }

  /*
    display single tasks.
   */
  onSingleTask(){
    this.isClickedSingleTask = !this.isClickedSingleTask;
    console.log("click single task");
  }
  getSingleTasks() {
    return this.categories[0].tasks;
  }

  onAddNewCategorie(){
    this.isAddNewCategorieClicked = true;
    console.log("click add new categorie",this.isAddNewCategorieClicked);
  }
  onCancelNewCategorie(){
    this.isAddNewCategorieClicked = false;
    console.log("cancel new project",this.isAddNewCategorieClicked);
  }

  /*
    add new category && update localeStorage.
   */
  onSaveNewCategorie(){
    this.numberCategories += 1;
    let newCategorie = new CategorieModele(this.numberCategories,this.projectName);
    console.log(newCategorie);
    this.categories.push(newCategorie);
    this.displayCategorie.push(false);
    this.taskService.addNewCategorie(newCategorie);
    this.projectName = "";
    this.visualiseHistoriqueTask[this.numberCategories] = [];
    this.isEditTaskCategorie[this.numberCategories] = [];
    console.log("new project has been add!!");
    this.isAddNewCategorieClicked = false;
  }

  onDisplayCategorie(position : number){
    this.displayCategorie[position] = !this.displayCategorie[position];
  }
  /*
   * add task
   * input : identifier of the category to which the task will be added.
   * update localStorage
   */
  onSaveNewTask(idCategorie : number){
    let newTask = new Task(this.categories[idCategorie].tasks.length+1,this.taskName);
    this.categories[idCategorie].tasks.push(newTask);
    this.taskService.addNewTaskToCategorie(idCategorie,newTask);
    this.displayAddTaskCategorie[idCategorie] = false;
    this.taskName = "";
    this.visualiseHistoriqueTask[idCategorie].push(false);
    this.isEditTaskCategorie[idCategorie].push(false);
    console.log("task add");

  }
  /*
   start the stopwatch for the selected task
   input : identifier of the task.
   then: init a subscription for the selected task.
   */
  onDemarerTache(idCategorie : number ,idTask : number){
    let demarage = !this.categories[idCategorie].tasks[idTask].estDemaree;

    let taskName = this.categories[idCategorie].tasks[idTask].taskName;
    this.categories[idCategorie].tasks[idTask].estDemaree = demarage;
    if(demarage){
      this.date_debut = new Date();
      console.log("démarrage");
      let subscription = interval(1000).subscribe((valeur:number) => this.categories[idCategorie].tasks[idTask].temps += 1);
      this.subscriptions[taskName] = subscription;
    }else{
      console.log("arrèt",demarage);
      this.subscriptions[taskName].unsubscribe();
      this.categories[idCategorie].tasks[idTask].intervalles.push([this.date_debut,new Date()]);
      //update the time spent on this task only if it has been stopped.
      this.taskService.updateTask(idCategorie,idTask,this.categories[idCategorie].tasks[idTask]);
    }
  }
  /*
    hours : minutes : seconds
   */
  getTimeRepresentation(temps : number){
    let seconds = Math.floor(temps%60);
    let hours = Math.floor(temps/3600);
    return hours > 0 ? hours < 10 ? "0"+hours : hours : "" +  Math.floor(temps/60) + ":" + (seconds < 10 ? "0"+seconds : seconds );
  }

  onCancelNewTask(idCategorie){
    this.displayAddTaskCategorie[idCategorie] = false;
    console.log("add task canceled");
  }

  /*
   * display the form for adding a task
   */
  onAddTask(idCategorie : number){
    this.displayAddTaskCategorie[idCategorie] = true;
  }

  /*
    deleting a task
  */
  onDeleteTask(idCategorie : number, idTask : number){
    this.categories[idCategorie].tasks.splice(idTask,1);
    this.taskService.deleteTask(idCategorie,idTask);
    console.log("the task has been deleted");
  }

  displayEditTaskCategorie(idCategory : number, idTask : number){
    return this.isEditTaskCategorie[idCategory][idTask];
  }

  /*
    display the edit form
   */
  onEditTask(idCategory : number, idTask : number){
    this.taskName = this.categories[idCategory].tasks[idTask].taskName;
    return this.isEditTaskCategorie[idCategory][idTask]= true;
  }

  /*
   * task edition.
   * return 0 if no category has been selected.
   * remove the task from its base category.
   * create the task in the selected category..
   * update localStorage.
   */
  onEditTaskCategorie(idCategory : number, idTask : number){
    if(!this.categorieSelected){
      this.wrongCategorySelected = true;
      return 0;
    }
    let task = this.categories[idCategory].tasks[idTask];
    task.taskName = this.taskName;
    if(this.categories[idCategory].categorieName === this.categorieSelected){
      this.categories[idCategory].tasks[idTask]= task;
      this.taskService.updateTask(idCategory,idTask,task);
    }else{
      let idCategoryTmp = -1;
      for(let i=0; i<this.numberCategories; i++){
        if(this.categories[i].categorieName === this.categorieSelected){
          idCategoryTmp = i;
          break;
        }
      }
      this.categories[idCategoryTmp].tasks.push(task);
      this.taskService.addNewTaskToCategorie(idCategoryTmp,task);
      this.onDeleteTask(idCategory,idTask);
      this.taskService.deleteTask(idCategory,idTask);
    }
    console.log("task has been edited");
    this.isEditTaskCategorie[idCategory][idTask] = false
    this.taskName = "";
    this.categorieSelected = "";
    this.wrongCategorySelected = false;
    return 0;
  }
  onCancelEditTask(idCategory : number, idTask : number){
     this.isEditTaskCategorie[idCategory][idTask] = false;
  }

  /*
   *return category name.
   */
  getNameCategories(){
    let names = [];
    this.categories.forEach(element => {
      names.push(element.categorieName);
    });
    return names;
  }

  getTempsCategorie(idCategory : number){
    let temps = 0;
    this.categories[idCategory].tasks.forEach((task)=>{
      temps += task.temps;
    });
    return this.getTimeRepresentation(temps);

  }

  getTimeAllTasks(){
    let temps = 0;
    this.categories.forEach((categorie)=>{
      categorie.tasks.forEach((task)=>{
        temps +=  task.temps;
      });
    });
    return this.getTimeRepresentation(temps);
  }

  /*
   *task history.
   */
  onVisualiserHistorique(idCategory : number, idTask : number){
    this.historiques = {};
    this.visualiseHistoriqueTask[idCategory][idTask] = !this.visualiseHistoriqueTask[idCategory][idTask];

    this.categories[idCategory].tasks[idTask].intervalles.forEach((intervalle) => {
      this.date_debut = intervalle[0];
      if(!this.historiques[this.date_debut.toString().slice(0,10)]){
        this.historiques[this.date_debut.toString().slice(0,10)] = [];
      }
      let date_fin = intervalle[1];
      let heure_debut = this.date_debut.toString().slice(11,17);
      let heure_fin = date_fin.toString().slice(11,17);
      let duree = (Number(date_fin.toString().slice(11,13)) - Number(this.date_debut.toString().slice(11,13))).toString() + " : " +(Number(date_fin.toString().slice(14,16)) - Number(this.date_debut.toString().slice(14,16))).toString();
      this.historiques[this.date_debut.toString().slice(0,10)].push([heure_debut,heure_fin,duree]);
    });
  }


  /*
  * return all started tasks..
  */
  getAllActivedTasks(){
    let actived_tasks = [];
    let i=0, j=0;
    this.categories.forEach((categorie) => {
      //keep the task identifier as well as the category identifier to be able to stop it later.
      j = 0;
      categorie.tasks.forEach((task) => {
        if(task.estDemaree){
          actived_tasks.push({
            "task" : task,
            "idCategory" : i,
            "idTask" : j
          });
        }
        j+=1;
      });
      i+=1;
    });
    return actived_tasks;
  }
}

type Duree = [string,string,string];

