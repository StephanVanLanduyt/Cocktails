# /api-service/start.sh

#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Execute Uvicorn, correctly substituting the environment variables
# We use 'exec' to replace the current shell process with the uvicorn process
exec uvicorn cocktails.main:app --host "${APP_BIND_HOST}" --port "${APP_BIND_PORT}" --proxy-headers