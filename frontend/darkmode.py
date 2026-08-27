import os
import re

directories = ['app', 'src/components', 'src/components/ui']

replacements = {
    r'\bbg-white\b': 'bg-white dark:bg-slate-800',
    r'\btext-gray-900\b': 'text-gray-900 dark:text-gray-100',
    r'\btext-gray-800\b': 'text-gray-800 dark:text-gray-200',
    r'\btext-gray-700\b': 'text-gray-700 dark:text-gray-300',
    r'\btext-gray-500\b': 'text-gray-500 dark:text-gray-400',
    r'\btext-gray-600\b': 'text-gray-600 dark:text-gray-400',
    r'\bborder-gray-200\b': 'border-gray-200 dark:border-slate-700',
    r'\bborder-gray-100\b': 'border-gray-100 dark:border-slate-700',
    r'\bborder-gray-300\b': 'border-gray-300 dark:border-slate-600',
    r'\bbg-gray-50\b': 'bg-gray-50 dark:bg-slate-900',
    r'\bbg-gray-100\b': 'bg-gray-100 dark:bg-slate-800',
    r'\bbg-gray-200\b': 'bg-gray-200 dark:bg-slate-700',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    for pattern, replacement in replacements.items():
        # Only replace if the replacement isn't already there
        content = re.sub(pattern + r'(?!\s+dark:)', replacement, content)
        
    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in directories:
    if os.path.exists(d):
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    process_file(os.path.join(root, file))
