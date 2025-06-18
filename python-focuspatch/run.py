#!/usr/bin/env python3
"""
FocusPatch Launcher
Simple script to run FocusPatch in different modes
"""

import sys
import subprocess

def main():
    print("🚀 FocusPatch Python Version Launcher")
    print("=" * 40)
    print("1. Run in Desktop Mode")
    print("2. Run in Web Browser Mode") 
    print("3. Install Dependencies")
    print("4. Exit")
    print("=" * 40)
    
    while True:
        choice = input("Select an option (1-4): ").strip()
        
        if choice == "1":
            print("🖥️  Starting FocusPatch in Desktop Mode...")
            run_desktop()
            break
        elif choice == "2":
            print("🌐 Starting FocusPatch in Web Browser Mode...")
            run_web()
            break
        elif choice == "3":
            print("📦 Installing dependencies...")
            install_deps()
            break
        elif choice == "4":
            print("👋 Goodbye!")
            sys.exit(0)
        else:
            print("❌ Invalid choice. Please select 1-4.")

def run_desktop():
    """Run the app in desktop mode"""
    try:
        # Modify main.py to use desktop mode
        with open('main.py', 'r') as f:
            content = f.read()
        
        # Replace the last line to use desktop mode
        content = content.replace(
            'ft.app(target=main, view=ft.WEB_BROWSER)',
            'ft.app(target=main)'
        )
        
        with open('main.py', 'w') as f:
            f.write(content)
        
        subprocess.run([sys.executable, 'main.py'])
    except Exception as e:
        print(f"❌ Error running desktop mode: {e}")

def run_web():
    """Run the app in web browser mode"""
    try:
        # Modify main.py to use web browser mode
        with open('main.py', 'r') as f:
            content = f.read()
        
        # Ensure the last line uses web browser mode
        if 'ft.app(target=main)' in content:
            content = content.replace(
                'ft.app(target=main)',
                'ft.app(target=main, view=ft.WEB_BROWSER)'
            )
        
        with open('main.py', 'w') as f:
            f.write(content)
        
        subprocess.run([sys.executable, 'main.py'])
    except Exception as e:
        print(f"❌ Error running web mode: {e}")

def install_deps():
    """Install required dependencies"""
    try:
        print("Installing Flet...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'flet'], check=True)
        print("✅ Dependencies installed successfully!")
        print("You can now run the app using options 1 or 2.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")

if __name__ == "__main__":
    main() 