#!/usr/bin/env python3
"""
FocusPatch - Python Version (Basic)
A productivity app for managing daily tasks and goals
Built with Flet (Flutter for Python) - Basic Version
"""

import flet as ft
import json
import os
import sys
import platform
from datetime import datetime
from typing import List, Dict, Any

class FocusPatchApp:
    def __init__(self):
        self.tasks: List[Dict[str, Any]] = []
        self.current_day = 0
        
        # Cross-platform data directory and file handling
        self.data_dir = self._get_data_directory()
        self.data_file = os.path.join(self.data_dir, "focuspatch_data.json")
        
        # Ensure data directory exists
        self._ensure_data_directory()
        
        # Load existing data
        self.load_data()
    
    def _get_data_directory(self) -> str:
        """Get the appropriate data directory for the current OS"""
        system = platform.system().lower()
        
        if system == "windows":
            base_dir = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
            return os.path.join(base_dir, 'FocusPatch')
        elif system == "darwin":  # macOS
            base_dir = os.path.expanduser('~/Library/Application Support')
            return os.path.join(base_dir, 'FocusPatch')
        else:  # Linux and other Unix-like systems
            xdg_data_home = os.environ.get('XDG_DATA_HOME')
            if xdg_data_home:
                return os.path.join(xdg_data_home, 'FocusPatch')
            else:
                return os.path.join(os.path.expanduser('~'), '.local', 'share', 'FocusPatch')
    
    def _ensure_data_directory(self):
        """Ensure the data directory exists"""
        try:
            os.makedirs(self.data_dir, exist_ok=True)
            print(f"📁 [dataDir] Using: {self.data_dir}")
        except Exception as e:
            print(f"❌ [dataDir] Error creating directory: {e}")
            self.data_dir = "."
            self.data_file = "focuspatch_data.json"
    
    def load_data(self):
        """Load tasks from JSON file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.tasks = data.get('tasks', [])
                    print(f"🔵 [loadData] Loaded {len(self.tasks)} tasks")
        except Exception as e:
            print(f"❌ [loadData] Error: {e}")
            self.tasks = []
    
    def save_data(self):
        """Save tasks to JSON file"""
        try:
            data = {
                'tasks': self.tasks,
                'lastSaved': datetime.now().isoformat()
            }
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ [saveData] Saved {len(self.tasks)} tasks")
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
    page.padding = 20
    
    # Initialize the app
    app = FocusPatchApp()
    
    # State variables
    current_screen = "home"
    
    # Create main content container
    content_container = ft.Container(expand=True)
    
    def create_task_item(task: Dict[str, Any]):
        """Create a task item"""
        def on_checkbox_change(e):
            app.toggle_task_completion(task['id'])
            update_content()
        
        return ft.Container(
            content=ft.Row([
                ft.Checkbox(
                    value=task.get('completed', False),
                    on_change=on_checkbox_change
                ),
                ft.Column([
                    ft.Text(task['title'], size=16),
                    ft.Text(task.get('time', ''), size=12)
                ], expand=True)
            ]),
            padding=10,
            margin=5,
            border_radius=8,
            bgcolor="#f0f0f0"
        )
    
    def create_home_screen():
        """Create the home screen"""
        def add_task(e):
            if task_input.value and task_input.value.strip():
                app.add_task(task_input.value.strip())
                task_input.value = ""
                update_content()
        
        task_input = ft.TextField(
            hint_text="Add a new task...",
            on_submit=add_task,
            expand=True
        )
        
        # Get tasks for today
        today_tasks = app.get_tasks_for_day(0)
        task_items = [create_task_item(task) for task in today_tasks]
        
        return ft.Column([
            ft.Text("🎯 FocusPatch", size=32, weight=ft.FontWeight.BOLD),
            ft.Container(height=10),
            ft.Text("📋 Today's Tasks", size=24, weight=ft.FontWeight.BOLD),
            ft.Container(height=10),
            ft.Row([
                task_input,
                ft.ElevatedButton("➕ Add", on_click=add_task)
            ]),
            ft.Container(height=20),
            ft.Column(task_items) if task_items else ft.Text("No tasks yet. Add one above!", size=16),
        ])
    
    def create_settings_screen():
        """Create the settings screen"""
        system_info = f"🖥️ OS: {platform.system()} {platform.release()}"
        python_info = f"🐍 Python: {sys.version.split()[0]}"
        data_dir_info = f"📁 Data: {app.data_dir}"
        
        return ft.Column([
            ft.Text("⚙️ Settings", size=32, weight=ft.FontWeight.BOLD),
            ft.Container(height=20),
            ft.Text("📊 System Information", size=20, weight=ft.FontWeight.BOLD),
            ft.Container(height=10),
            ft.Text(system_info, size=14),
            ft.Text(python_info, size=14),
            ft.Text(data_dir_info, size=14),
            ft.Container(height=20),
            ft.Text("ℹ️ About", size=20, weight=ft.FontWeight.BOLD),
            ft.Container(height=10),
            ft.Text("FocusPatch Python Version", size=16),
            ft.Text("Built with Flet Framework", size=14),
        ])
    
    def update_content():
        """Update the main content based on current screen"""
        if current_screen == "home":
            content_container.content = create_home_screen()
        elif current_screen == "settings":
            content_container.content = create_settings_screen()
        
        page.update()
    
    def switch_to_home(e):
        nonlocal current_screen
        current_screen = "home"
        update_content()
    
    def switch_to_settings(e):
        nonlocal current_screen
        current_screen = "settings"
        update_content()
    
    # Create simple navigation using text buttons
    nav_bar = ft.Container(
        content=ft.Row([
            ft.ElevatedButton("🏠 Home", on_click=switch_to_home, expand=True),
            ft.ElevatedButton("⚙️ Settings", on_click=switch_to_settings, expand=True),
        ]),
        padding=10
    )
    
    # Add components to page
    page.add(
        ft.Column([
            content_container,
            nav_bar
        ], expand=True)
    )
    
    # Load initial content
    update_content()

def print_startup_info():
    """Print startup information with OS detection"""
    system = platform.system()
    version = platform.version()
    architecture = platform.architecture()[0]
    python_version = sys.version.split()[0]
    
    print("=" * 50)
    print("🚀 FocusPatch Python Version Starting...")
    print("=" * 50)
    print(f"🖥️  Operating System: {system}")
    print(f"📋 OS Version: {version}")
    print(f"🏗️  Architecture: {architecture}")
    print(f"🐍 Python Version: {python_version}")
    print(f"📁 Data Directory: {FocusPatchApp()._get_data_directory()}")
    print("=" * 50)
    print("🌐 Opening application...")
    print("📱 Close window or press Ctrl+C to stop")
    print("=" * 50)

if __name__ == "__main__":
    try:
        print_startup_info()
        ft.app(target=main)
    except KeyboardInterrupt:
        print("\n👋 FocusPatch stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting FocusPatch: {e}")
        print("💡 Try running with: python main_basic.py")
    finally:
        print("🔚 FocusPatch Python Version stopped.") 