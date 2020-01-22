import sys
from setuptools import setup, find_packages

install_requires = ['']
classifiers = ["Programming Language :: Python",
               "Development Status :: 5 - Production/Stable",
               "Programming Language :: Python :: 3"]


setup(name='browsertime',
      version="0.1",
      url='https://github.com/sitespeedio/browsertime',
      packages=find_packages(),
      description=("Your browser, your page, your scripts!"),
      author="Tobias Lidskog",
      include_package_data=True,
      zip_safe=False,
      classifiers=classifiers,
      install_requires=install_requires,
      entry_points="""
      [console_scripts]
      visualmetrics.py = browsertime.visualmetrics:main
      """)
