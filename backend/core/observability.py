import os
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def setup_observability(app):
    # We instrument the app even if there is no exporter
    FastAPIInstrumentor.instrument_app(app)
