#!/usr/bin/env python3
"""
FocusPatch - Python Web Version
A productivity app for managing daily tasks and goals
Built with Flet (Flutter for Python) - Web Version for iOS Testing
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
        
        # Use local directory for web version
        self.data_dir = "."
        self.data_file = "focuspatch_web_data.json"
        
        # Load existing data
        self.load_data()
    
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
    # Configure the page for mobile
    page.title = "FocusPatch - iOS Test"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 10
    page.scroll = ft.ScrollMode.AUTO
    
    # Mobile-optimized settings (removed - not supported in current Flet version)
    
    # Initialize the app
    app = FocusPatchApp()
    
    # State variables
    current_screen = "home"
    
    # Create main content container
    content_container = ft.Container(expand=True)
    
    def create_task_item(task: Dict[str, Any]):
        """Create a mobile-optimized task item"""
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
                    ft.Text(task['title'], size=18, weight=ft.FontWeight.BOLD),
                    ft.Text(task.get('time', ''), size=14, color="#666666")
                ], expand=True, spacing=2)
            ], alignment=ft.MainAxisAlignment.START),
            padding=15,
            margin=ft.margin.only(bottom=8),
            border_radius=12,
            bgcolor="#f8f9fa",
            border=ft.border.all(1, "#e9ecef")
        )
    
    def create_home_screen():
        """Create the mobile-optimized home screen"""
        def add_task(e):
            if task_input.value and task_input.value.strip():
                app.add_task(task_input.value.strip())
                task_input.value = ""
                page.update()
                update_content()
        
        task_input = ft.TextField(
            hint_text="Add a new task...",
            on_submit=add_task,
            expand=True,
            height=50,
            text_size=16,
            border_radius=12
        )
        
        # Get tasks for today
        today_tasks = app.get_tasks_for_day(0)
        task_items = [create_task_item(task) for task in today_tasks]
        
        return ft.Column([
            # Header
            ft.Container(
                content=ft.Text("🎯 FocusPatch", size=28, weight=ft.FontWeight.BOLD, color="#2c3e50"),
                padding=ft.padding.only(bottom=10)
            ),
            
            # Task input
            ft.Container(
                content=ft.Row([
                    task_input,
                    ft.Container(
                        content=ft.ElevatedButton(
                            "➕",
                            on_click=add_task,
                            bgcolor="#007AFF",
                            color="white",
                            width=50,
                            height=50
                        ),
                        width=50,
                        height=50
                    )
                ], spacing=10),
                padding=ft.padding.only(bottom=20)
            ),
            
            # Tasks section
            ft.Text("📋 Today's Tasks", size=20, weight=ft.FontWeight.BOLD, color="#34495e"),
            ft.Container(height=10),
            
            # Tasks list
            ft.Column(
                task_items if task_items else [
                    ft.Container(
                        content=ft.Text("No tasks yet. Add one above! 📝", size=16, color="#7f8c8d"),
                        padding=20,
                        alignment=ft.alignment.center
                    )
                ],
                spacing=0
            ),
        ], scroll=ft.ScrollMode.AUTO)
    
    def create_info_screen():
        """Create info screen with connection details"""
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
            ft.Text("📱 iOS Connection Info", size=24, weight=ft.FontWeight.BOLD),
            ft.Container(height=20),
            
            ft.Container(
                content=ft.Column([
                    ft.Text("🌐 Access this app on your iOS device:", size=16, weight=ft.FontWeight.BOLD),
                    ft.Container(height=10),
                    ft.Text(f"📍 Local IP: {local_ip}:8550", size=14),
                    ft.Text("📍 URL: http://[IP]:8550", size=14),
                    ft.Container(height=10),
                    ft.Text("📋 Instructions:", size=16, weight=ft.FontWeight.BOLD),
                    ft.Text("1. Make sure your iOS device is on the same WiFi", size=14),
                    ft.Text("2. Open Safari on your iOS device", size=14),
                    ft.Text("3. Navigate to the URL above", size=14),
                    ft.Text("4. Add to Home Screen for app-like experience", size=14),
                ]),
                padding=20,
                bgcolor="#f8f9fa",
                border_radius=12,
                border=ft.border.all(1, "#dee2e6")
            ),
            
            ft.Container(height=20),
            ft.Text("ℹ️ System Info", size=20, weight=ft.FontWeight.BOLD),
            ft.Container(height=10),
            ft.Text(f"🖥️ OS: {platform.system()} {platform.release()}", size=14),
            ft.Text(f"🐍 Python: {sys.version.split()[0]}", size=14),
            ft.Text("🚀 Framework: Flet (Flutter for Python)", size=14),
        ], scroll=ft.ScrollMode.AUTO)
    
    def update_content():
        """Update the main content based on current screen"""
        if current_screen == "home":
            content_container.content = create_home_screen()
        elif current_screen == "info":
            content_container.content = create_info_screen()
        
        page.update()
    
    def switch_to_home(e):
        nonlocal current_screen
        current_screen = "home"
        update_content()
    
    def switch_to_info(e):
        nonlocal current_screen
        current_screen = "info"
        update_content()
    
    # Create mobile-optimized navigation
    nav_bar = ft.Container(
        content=ft.Row([
            ft.Container(
                content=ft.TextButton(
                    "🏠 Tasks",
                    on_click=switch_to_home,
                    style=ft.ButtonStyle(color="white")
                ),
                bgcolor="#007AFF" if current_screen == "home" else "#8E8E93",
                border_radius=25,
                padding=ft.padding.symmetric(horizontal=20, vertical=10),
                expand=True
            ),
            ft.Container(width=10),
            ft.Container(
                content=ft.TextButton(
                    "📱 iOS Info",
                    on_click=switch_to_info,
                    style=ft.ButtonStyle(color="white")
                ),
                bgcolor="#007AFF" if current_screen == "info" else "#8E8E93",
                border_radius=25,
                padding=ft.padding.symmetric(horizontal=20, vertical=10),
                expand=True
            ),
        ]),
        padding=15,
        bgcolor="white"
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
    """Print startup information for web version"""
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
    print("🚀 FocusPatch Python Web Version Starting...")
    print("=" * 60)
    print(f"🖥️  Host OS: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version.split()[0]}")
    print(f"🌐 Web Server: Starting on port 8550")
    print(f"📍 Local Access: http://localhost:8550")
    print(f"📱 iOS Access: http://{local_ip}:8550")
    print("=" * 60)
    print("📋 iOS Instructions:")
    print("1. Make sure your iOS device is on the same WiFi network")
    print("2. Open Safari on your iOS device")
    print(f"3. Navigate to: http://{local_ip}:8550")
    print("4. Tap 'Share' → 'Add to Home Screen' for app-like experience")
    print("=" * 60)
    print("🔧 Controls:")
    print("• Press Ctrl+C to stop the server")
    print("• App will be accessible until server is stopped")
    print("=" * 60)

if __name__ == "__main__":
    try:
        print_startup_info()
        # Run as web app on port 8550 with host accessible from network
        ft.app(target=main, port=8550, host="0.0.0.0")
    except KeyboardInterrupt:
        print("\n👋 FocusPatch web server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting FocusPatch web server: {e}")
        print("💡 Make sure port 8550 is available")
    finally:
        print("🔚 FocusPatch web server stopped.") 