export class Task {
  id: number;
  taskName: string;
  temps: number;
  estDemaree: boolean;
  intervalles: coupeDate[];
  constructor(id_task: number,task_name : string) {
    this.id = id_task;
    this.taskName = task_name;
    this.temps = 0;
    this.estDemaree = false;
    this.intervalles = [];
  }
}
type coupeDate = [Date,Date];


