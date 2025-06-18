#!/usr/bin/env python3
"""
FocusPatch - Python Version (Expo Style)
A productivity app for managing daily tasks and goals
Built with Flet (Flutter for Python) - Matching Expo Design
"""

import flet as ft
import json
import os
import sys
import platform
from datetime import datetime, timedelta
from typing import List, Dict, Any

class FocusPatchApp:
    def __init__(self):
        self.tasks: List[Dict[str, Any]] = []
        self.goals: List[Dict[str, Any]] = []
        
        # Use local directory for web version
        self.data_dir = "."
        self.data_file = "focuspatch_expo_data.json"
        
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
                    print(f"🔵 [loadData] Loaded {len(self.tasks)} tasks, {len(self.goals)} goals")
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
            print(f"✅ [saveData] Saved {len(self.tasks)} tasks, {len(self.goals)} goals")
        except Exception as e:
            print(f"❌ [saveData] Error: {e}")
    
    def add_task(self, title: str, day: int = 0, time: str = "", category: str = "general"):
        """Add a new task"""
        new_task = {
            'id': str(int(datetime.now().timestamp() * 1000)),
            'title': title,
            'time': time or datetime.now().strftime("%I:%M %p"),
            'category': category,
            'day': day,
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
    # Configure the page to match Expo version
    page.title = "FocusPatch"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 0
    page.bgcolor = "#f5f5f5"
    
    # Initialize the app
    app = FocusPatchApp()
    
    # State variables
    current_screen = "home"
    new_task_input = ft.TextField(
        hint_text="Add a new task...",
        border_radius=25,
        height=50,
        text_size=16,
        bgcolor="white",
        expand=True
    )
    
    def get_day_name(day_offset: int) -> str:
        """Get day name for offset (0=today, 1=tomorrow, etc.)"""
        target_date = datetime.now() + timedelta(days=day_offset)
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return day_names[target_date.weekday()]
    
    def get_day_date(day_offset: int) -> str:
        """Get formatted date for day offset"""
        target_date = datetime.now() + timedelta(days=day_offset)
        return target_date.strftime("%b %d")
    
    def create_task_item(task: Dict[str, Any]):
        """Create a task item matching Expo style"""
        def on_checkbox_change(e):
            app.toggle_task_completion(task['id'])
            update_content()
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    task['title'], 
                    size=14, 
                    weight=ft.FontWeight.W_500,
                    color="#333333"
                ),
                ft.Text(
                    task.get('time', ''), 
                    size=12, 
                    color="#666666"
                )
            ], spacing=2),
            padding=ft.padding.symmetric(vertical=8, horizontal=12),
            margin=ft.margin.only(bottom=4),
            bgcolor="white" if not task.get('completed') else "#f0f0f0",
            border_radius=8,
            border=ft.border.all(1, "#e0e0e0"),
            on_click=lambda e: (app.toggle_task_completion(task['id']), update_content())
        )
    
    def create_day_column(day_offset: int):
        """Create a day column matching Expo style"""
        day_name = get_day_name(day_offset)
        day_date = get_day_date(day_offset)
        tasks = app.get_tasks_for_day(day_offset)
        
        # Create time slots (like in Expo version)
        time_slots = []
        current_hour = datetime.now().hour
        
        # Add existing tasks
        for task in tasks:
            time_slots.append(create_task_item(task))
        
        # Add some empty time slots if no tasks
        if not tasks:
            for i in range(3):
                hour = (current_hour + i) % 24
                time_str = f"{hour:02d}:00"
                time_slots.append(
                    ft.Container(
                        content=ft.Text(
                            f"{time_str}",
                            size=12,
                            color="#999999"
                        ),
                        padding=ft.padding.symmetric(vertical=8, horizontal=12),
                        margin=ft.margin.only(bottom=4),
                        height=30
                    )
                )
        
        return ft.Container(
            content=ft.Column([
                # Day header
                ft.Container(
                    content=ft.Column([
                        ft.Text(
                            day_name,
                            size=16,
                            weight=ft.FontWeight.BOLD,
                            color="#333333"
                        ),
                        ft.Text(
                            day_date,
                            size=12,
                            color="#666666"
                        )
                    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
                    padding=ft.padding.all(12),
                    bgcolor="white",
                    border_radius=ft.border_radius.only(top_left=12, top_right=12),
                    border=ft.border.all(1, "#e0e0e0")
                ),
                # Tasks container
                ft.Container(
                    content=ft.Column(
                        time_slots,
                        scroll=ft.ScrollMode.AUTO,
                        spacing=0
                    ),
                    bgcolor="#fafafa",
                    border=ft.border.all(1, "#e0e0e0"),
                    border_radius=ft.border_radius.only(bottom_left=12, bottom_right=12),
                    padding=ft.padding.all(8),
                    expand=True
                )
            ], spacing=0),
            expand=True,
            margin=ft.margin.symmetric(horizontal=4)
        )
    
    def create_home_screen():
        """Create the home screen matching Expo three-column layout"""
        def add_task(e):
            if new_task_input.value and new_task_input.value.strip():
                # Add to today (day 0) by default
                app.add_task(new_task_input.value.strip(), day=0)
                new_task_input.value = ""
                page.update()
                update_content()
        
        return ft.Column([
            # Header matching Expo style
            ft.Container(
                content=ft.Row([
                    ft.Text(
                        "FocusPatch",
                        size=24,
                        weight=ft.FontWeight.BOLD,
                        color="#333333"
                    ),
                    ft.Row([
                        ft.Container(
                            content=ft.Text("Goals", size=14, color="white"),
                            bgcolor="#007AFF",
                            padding=ft.padding.symmetric(horizontal=16, vertical=8),
                            border_radius=20,
                            on_click=lambda e: switch_to_goals(e)
                        ),
                        ft.Container(
                            content=ft.Text("Settings", size=14, color="white"),
                            bgcolor="#34C759",
                            padding=ft.padding.symmetric(horizontal=16, vertical=8),
                            border_radius=20,
                            on_click=lambda e: switch_to_settings(e)
                        )
                    ], spacing=8)
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                padding=ft.padding.all(16),
                bgcolor="white",
                border=ft.border.only(bottom=ft.BorderSide(1, "#e0e0e0"))
            ),
            
            # Three-day column layout
            ft.Container(
                content=ft.Row([
                    create_day_column(0),  # Today
                    create_day_column(1),  # Tomorrow  
                    create_day_column(2),  # Day after
                ], spacing=8, expand=True),
                padding=ft.padding.all(12),
                expand=True
            ),
            
            # Bottom input bar matching Expo style
            ft.Container(
                content=ft.Row([
                    new_task_input,
                    ft.Container(
                        content=ft.Text("➕", size=20, color="white"),
                        bgcolor="#007AFF",
                        width=50,
                        height=50,
                        border_radius=25,
                        alignment=ft.alignment.center,
                        on_click=add_task
                    )
                ], spacing=12),
                padding=ft.padding.all(16),
                bgcolor="white",
                border=ft.border.only(top=ft.BorderSide(1, "#e0e0e0"))
            )
        ], spacing=0)
    
    def create_goals_screen():
        """Create goals screen matching Expo style"""
        goal_items = []
        for goal in app.goals:
            goal_items.append(
                ft.Container(
                    content=ft.Column([
                        ft.Text(goal.get('title', 'Untitled Goal'), size=16, weight=ft.FontWeight.BOLD),
                        ft.Text(goal.get('subtitle', ''), size=14),
                        ft.ProgressBar(
                            value=goal.get('completed', 0) / max(goal.get('total', 1), 1),
                            bgcolor="#e0e0e0",
                            color="#007AFF"
                        )
                    ]),
                    padding=ft.padding.all(16),
                    margin=ft.margin.only(bottom=8),
                    bgcolor="white",
                    border_radius=12,
                    border=ft.border.all(1, "#e0e0e0")
                )
            )
        
        return ft.Column([
            # Header
            ft.Container(
                content=ft.Row([
                    ft.Container(
                        content=ft.Text("← Back", size=16, color="#007AFF"),
                        on_click=lambda e: switch_to_home(e),
                        padding=ft.padding.all(8)
                    ),
                    ft.Text("Goals", size=24, weight=ft.FontWeight.BOLD),
                ]),
                padding=ft.padding.all(16),
                bgcolor="white",
                border=ft.border.only(bottom=ft.BorderSide(1, "#e0e0e0"))
            ),
            
            # Goals list
            ft.Container(
                content=ft.Column(
                    goal_items if goal_items else [
                        ft.Container(
                            content=ft.Text("No goals yet. Goals from the React Native version would appear here.", size=16),
                            padding=20,
                            alignment=ft.alignment.center
                        )
                    ],
                    scroll=ft.ScrollMode.AUTO
                ),
                expand=True,
                padding=ft.padding.all(16)
            )
        ])
    
    def create_settings_screen():
        """Create settings screen"""
        import socket
        
        # Get local IP address
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
        except:
            local_ip = "Unable to detect"
        
        return ft.Column([
            # Header
            ft.Container(
                content=ft.Row([
                    ft.Container(
                        content=ft.Text("← Back", size=16, color="#007AFF"),
                        on_click=lambda e: switch_to_home(e),
                        padding=ft.padding.all(8)
                    ),
                    ft.Text("Settings", size=24, weight=ft.FontWeight.BOLD),
                ]),
                padding=ft.padding.all(16),
                bgcolor="white",
                border=ft.border.only(bottom=ft.BorderSide(1, "#e0e0e0"))
            ),
            
            # Settings content
            ft.Container(
                content=ft.Column([
                    ft.Container(
                        content=ft.Column([
                            ft.Text("📱 iOS Access", size=18, weight=ft.FontWeight.BOLD),
                            ft.Text(f"🌐 URL: http://{local_ip}:8550", size=14),
                            ft.Text("1. Connect iOS device to same WiFi", size=12),
                            ft.Text("2. Open Safari and navigate to URL above", size=12),
                            ft.Text("3. Add to Home Screen for app-like experience", size=12),
                        ]),
                        padding=ft.padding.all(16),
                        bgcolor="white",
                        border_radius=12,
                        border=ft.border.all(1, "#e0e0e0"),
                        margin=ft.margin.only(bottom=16)
                    ),
                    
                    ft.Container(
                        content=ft.Column([
                            ft.Text("ℹ️ System Info", size=18, weight=ft.FontWeight.BOLD),
                            ft.Text(f"🖥️ OS: {platform.system()} {platform.release()}", size=14),
                            ft.Text(f"🐍 Python: {sys.version.split()[0]}", size=14),
                            ft.Text("🚀 Framework: Flet (Flutter for Python)", size=14),
                        ]),
                        padding=ft.padding.all(16),
                        bgcolor="white",
                        border_radius=12,
                        border=ft.border.all(1, "#e0e0e0")
                    )
                ], scroll=ft.ScrollMode.AUTO),
                expand=True,
                padding=ft.padding.all(16)
            )
        ])
    
    # Main content container
    content_container = ft.Container(expand=True)
    
    def update_content():
        """Update the main content based on current screen"""
        if current_screen == "home":
            content_container.content = create_home_screen()
        elif current_screen == "goals":
            content_container.content = create_goals_screen()
        elif current_screen == "settings":
            content_container.content = create_settings_screen()
        
        page.update()
    
    def switch_to_home(e):
        nonlocal current_screen
        current_screen = "home"
        update_content()
    
    def switch_to_goals(e):
        nonlocal current_screen
        current_screen = "goals"
        update_content()
    
    def switch_to_settings(e):
        nonlocal current_screen
        current_screen = "settings"
        update_content()
    
    # Add main container to page
    page.add(content_container)
    
    # Load initial content
    update_content()

def print_startup_info():
    """Print startup information for Expo-style version"""
    import socket
    
    # Get local IP address
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "Unable to detect IP"
    
    print("=" * 60)
    print("🚀 FocusPatch Python (Expo Style) Starting...")
    print("=" * 60)
    print(f"🖥️  Host OS: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version.split()[0]}")
    print(f"🌐 Web Server: Starting on port 8550")
    print(f"📍 Local Access: http://localhost:8550")
    print(f"📱 iOS Access: http://{local_ip}:8550")
    print("=" * 60)
    print("🎯 Features:")
    print("• Three-day column layout (matches Expo version)")
    print("• Task management with time slots")
    print("• Goals screen (placeholder)")
    print("• Settings with iOS connection info")
    print("=" * 60)
    print("📋 iOS Instructions:")
    print("1. Make sure your iOS device is on the same WiFi network")
    print("2. Open Safari on your iOS device")
    print(f"3. Navigate to: http://{local_ip}:8550")
    print("4. Tap 'Share' → 'Add to Home Screen' for app-like experience")
    print("=" * 60)

if __name__ == "__main__":
    try:
        print_startup_info()
        # Run as web app on port 8550 with host accessible from network
        ft.app(target=main, port=8550, host="0.0.0.0")
    except KeyboardInterrupt:
        print("\n👋 FocusPatch Expo-style version stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting FocusPatch: {e}")
        print("💡 Make sure port 8550 is available")
    finally:
        print("🔚 FocusPatch Expo-style version stopped.") 