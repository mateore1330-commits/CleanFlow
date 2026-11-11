"""
LA API DE CLEANFLOW EN VERCEL (DEPLOY-01).

Vercel ejecuta este archivo como una función de Python: todo /api/... le
llega aquí (lo redirige vercel.json), y aquí solo se carga la app de
Flask que vive en src/app.py. La web no pasa por aquí: Vercel la sirve
estática desde dist/, desde su red.

src va el primero en la ruta de búsqueda: así «api» es el paquete de la
app (src/api) y no esta carpeta.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src"))

from app import app  # noqa: E402,F401  (Vercel busca la variable «app»)
