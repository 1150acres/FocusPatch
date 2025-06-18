#!/usr/bin/env python3
"""
FocusPatch - Python Version
A productivity app for managing daily tasks and goals
Built with Flet (Flutter for Python)
"""

import flet as ft
import json
import os
from datetime import datetime
import uuid
import asyncio
from typing import List, Dict, Any

class FocusPatchApp:
    def __init__(self):
        self.tasks: List[Dict[str, Any]] = []
        self.goals: List[Dict[str, Any]] = []
        self.current_day = 0
        self.data_file = "focuspatch_data.json"
        self.selected_goal_id = None
        
        # Load existing data
        self.load_data()
    
    def load_data(self):
        """Load tasks and goals from JSON file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.tasks = data.get('tasks', [])
                    self.goals = data.get('goals', [])
                    print(f"🔵 [loadData] Loaded {len(self.tasks)} tasks and {len(self.goals)} goals")
        except Exception as e:
            print(f"❌ [loadData] Error: {e}")
            self.tasks = []
            self.goals = []
    
    def save_data(self):
        """Save tasks and goals to JSON file"""
        try:
            data = {
                'tasks': self.tasks,
                'goals': self.goals,
                'lastSaved': datetime.now().isoformat()
            }
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ [saveData] Saved {len(self.tasks)} tasks and {len(self.goals)} goals")
        except Exception as e:
            print(f"❌ [saveData] Error: {e}")
    
    def add_task(self, title: str, time: str = "", category: str = "general"):
        """Add a new task"""
        new_task = {
            'id': str(int(datetime.now().timestamp() * 1000)),
            'title': title,
            'time': time or datetime.now().strftime("%I:%M %p"),
            'category': category,
            'day': self.current_day,
            'completed': False
        }
        self.tasks.append(new_task)
        self.save_data()
        return new_task
    
    def add_goal(self, title: str, subtitle: str = "", icon: str = "🎯"):
        """Add a new goal"""
        new_goal = {
            'id': f"goal-{int(datetime.now().timestamp() * 1000)}",
            'title': title,
            'subtitle': subtitle,
            'icon': icon,
            'steps': [],
            'completed': 0,
            'total': 0,
            'createdAt': datetime.now().isoformat()
        }
        self.goals.append(new_goal)
        self.save_data()
        return new_goal
    
    def toggle_task_completion(self, task_id: str):
        """Toggle task completion status"""
        for task in self.tasks:
            if task['id'] == task_id:
                task['completed'] = not task.get('completed', False)
                self.save_data()
                break
    
    def get_tasks_for_day(self, day: int) -> List[Dict[str, Any]]:
        """Get all tasks for a specific day"""
        return [task for task in self.tasks if task.get('day', 0) == day]

def main(page: ft.Page):
    # Configure the page
    page.title = "FocusPatch"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.window_width = 400
    page.window_height = 800
    page.window_resizable = True
    page.padding = 0
    
    # Initialize the app
    app = FocusPatchApp()
    
    # State variables
    current_screen = ft.Ref[str]()
    current_screen.current = "home"
    
    # UI Components
    def create_app_bar():
        return ft.AppBar(
            title=ft.Text("FocusPatch", color=ft.colors.WHITE),
            bgcolor=ft.colors.BLUE_600,
            center_title=True
        )
    
    def create_bottom_navigation():
        def on_nav_change(e):
            current_screen.current = ["home", "goals", "settings"][e.control.selected_index]
            update_content()
        
        return ft.NavigationBar(
            selected_index=0,
            on_change=on_nav_change,
            destinations=[
                ft.NavigationDestination(icon=ft.icons.HOME, label="Home"),
                ft.NavigationDestination(icon=ft.icons.FLAG, label="Goals"),
                ft.NavigationDestination(icon=ft.icons.SETTINGS, label="Settings"),
            ]
        )
    
    def create_day_column(day_index: int, day_name: str):
        """Create a column for a specific day with tasks"""
        tasks_for_day = app.get_tasks_for_day(day_index)
        
        def add_task_to_day(e):
            if task_input.value.strip():
                app.add_task(task_input.value.strip(), category="general")
                task_input.value = ""
                update_content()
        
        task_input = ft.TextField(
            hint_text="Add task...",
            on_submit=add_task_to_day,
            expand=True
        )
        
        task_items = []
        for task in tasks_for_day:
            def toggle_task(task_id=task['id']):
                def handler(e):
                    app.toggle_task_completion(task_id)
                    update_content()
                return handler
            
            task_items.append(
                ft.Container(
                    content=ft.Row([
                        ft.Checkbox(
                            value=task.get('completed', False),
                            on_change=toggle_task(task['id'])
                        ),
                        ft.Column([
                            ft.Text(task['title'], size=14),
                            ft.Text(task.get('time', ''), size=12, color=ft.colors.GREY_600)
                        ], expand=True)
                    ]),
                    padding=10,
                    margin=ft.margin.only(bottom=5),
                    bgcolor=ft.colors.GREY_100,
                    border_radius=8
                )
            )
        
        return ft.Container(
            content=ft.Column([
                ft.Text(day_name, size=18, weight=ft.FontWeight.BOLD),
                ft.Container(height=10),
                *task_items,
                ft.Row([
                    task_input,
                    ft.IconButton(
                        icon=ft.icons.ADD,
                        on_click=add_task_to_day
                    )
                ])
            ]),
            width=350,
            padding=15,
            margin=10,
            bgcolor=ft.colors.WHITE,
            border_radius=12,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=5,
                color=ft.colors.GREY_300
            )
        )
    
    def create_home_screen():
        """Create the home screen with day columns"""
        days = ["Today", "Tomorrow", "Day After"]
        day_columns = [create_day_column(i, days[i]) for i in range(3)]
        
        return ft.Container(
            content=ft.Column([
                ft.Container(
                    content=ft.Row(
                        day_columns,
                        scroll=ft.ScrollMode.AUTO
                    ),
                    expand=True
                )
            ]),
            expand=True,
            padding=10
        )
    
    def create_goal_item(goal: Dict[str, Any]):
        """Create a goal item component"""
        progress = goal.get('completed', 0) / max(goal.get('total', 1), 1)
        
        def toggle_goal_expansion(e):
            # Toggle goal expansion logic here
            print(f"Goal pressed: {goal['id']}")
        
        return ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Text(goal.get('icon', '🎯'), size=20),
                    ft.Column([
                        ft.Text(goal['title'], size=16, weight=ft.FontWeight.BOLD),
                        ft.Text(goal.get('subtitle', ''), size=12, color=ft.colors.GREY_600) if goal.get('subtitle') else ft.Container(),
                        ft.ProgressBar(value=progress, width=200)
                    ], expand=True),
                    ft.Text(f"{goal.get('completed', 0)}/{goal.get('total', 0)}", size=12)
                ])
            ]),
            padding=15,
            margin=ft.margin.only(bottom=10),
            bgcolor=ft.colors.WHITE,
            border_radius=12,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=3,
                color=ft.colors.GREY_300
            ),
            on_click=toggle_goal_expansion
        )
    
    def create_goals_screen():
        """Create the goals screen"""
        def add_new_goal(e):
            if goal_input.value.strip():
                app.add_goal(goal_input.value.strip())
                goal_input.value = ""
                update_content()
        
        goal_input = ft.TextField(
            hint_text="Add new goal...",
            on_submit=add_new_goal,
            expand=True
        )
        
        goal_items = [create_goal_item(goal) for goal in app.goals]
        
        return ft.Container(
            content=ft.Column([
                ft.Container(
                    content=ft.Row([
                        goal_input,
                        ft.IconButton(
                            icon=ft.icons.ADD,
                            on_click=add_new_goal
                        )
                    ]),
                    padding=15
                ),
                ft.Container(
                    content=ft.Column(goal_items) if goal_items else ft.Text("No goals yet. Add one above!", 
                                                                           text_align=ft.TextAlign.CENTER),
                    expand=True,
                    padding=15
                )
            ]),
            expand=True
        )
    
    def create_settings_screen():
        """Create the settings screen"""
        return ft.Container(
            content=ft.Column([
                ft.Text("Settings", size=24, weight=ft.FontWeight.BOLD),
                ft.Container(height=20),
                ft.Text("FocusPatch Python Version", size=16),
                ft.Text("Built with Flet Framework", size=14, color=ft.colors.GREY_600),
                ft.Container(height=20),
                ft.ElevatedButton("Export Data", on_click=lambda e: print("Export data")),
                ft.ElevatedButton("Import Data", on_click=lambda e: print("Import data")),
                ft.ElevatedButton("Clear All Data", on_click=lambda e: print("Clear data"))
            ]),
            padding=20,
            expand=True
        )
    
    # Main content area
    content_area = ft.Container(expand=True)
    
    def update_content():
        """Update the main content based on current screen"""
        if current_screen.current == "home":
            content_area.content = create_home_screen()
        elif current_screen.current == "goals":
            content_area.content = create_goals_screen()
        elif current_screen.current == "settings":
            content_area.content = create_settings_screen()
        
        page.update()
    
    # Initialize the page layout
    page.add(
        ft.Column([
            create_app_bar(),
            content_area,
            create_bottom_navigation()
        ], expand=True)
    )
    
    # Load initial content
    update_content()

if __name__ == "__main__":
    print("🚀 Starting FocusPatch Python Version...")
    ft.app(target=main, view=ft.WEB_BROWSER) 