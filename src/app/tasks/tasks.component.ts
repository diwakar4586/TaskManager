import { CommonModule, isPlatformBrowser,formatDate  } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

interface Task {
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  tasks: Task[] = [];
  newTask: Task = { title: '', description: '', dueDate: '', priority: 'low', status: 'to-do' };
  editingTaskIndex: number = -1;
  isBrowser: boolean;
  today: string | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.loadTasks();
    this.setToday();
  }

  setToday() {
    const today = new Date();
    this.today = today.toISOString().split('T')[0];
  }

  addTask() {
    if (this.newTask.title && this.newTask.description && this.newTask.dueDate) {
      if (this.editingTaskIndex >= 0) {
        this.tasks[this.editingTaskIndex] = { ...this.newTask };
        this.editingTaskIndex = -1;
      } else {
        this.tasks.push({ ...this.newTask });
      }
      this.saveTasks();
      this.newTask = { title: '', description: '', dueDate: '', priority: 'low', status: 'to-do' };
    }
  }

  editTask(index: number) {
    this.newTask = { ...this.tasks[index] };
    this.editingTaskIndex = index;
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  updateTaskStatus(index: number, status: string) {
    this.tasks[index].status = status;
    this.saveTasks();
  }

  loadTasks() {
    if (this.isBrowser) {
      const tasks = localStorage.getItem('tasks');
      if (tasks) {
        this.tasks = JSON.parse(tasks);
      }
    }
  }

  saveTasks() {
    if (this.isBrowser) {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }

  sortTasksByDueDate() {
    this.tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }

  sortTasksByPriority() {
    const priorityOrder: { [key in Task['priority']]: number } = { 'high': 1, 'medium': 2, 'low': 3 };
    this.tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  sortTasksByStatus() {
    const statusOrder: { [key in Task['status']]: number } = { 'to-do': 1, 'in-progress': 2, 'completed': 3 };
    this.tasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }
  exportTasksToCSV() {
    const csvData = this.generateCSV();
    this.downloadCSV(csvData, 'tasks.csv');
  }
  generateCSV(): string {
    const header = ['Title', 'Description', 'Due Date', 'Priority', 'Status'];
    const rows = this.tasks.map(task => [
      task.title,
      task.description,
      task.dueDate,
      task.priority,
      task.status
    ]);
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(',')) 
    ].join('\n');

    return csvContent;
  }
  downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
