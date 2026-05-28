ARG SERVICE_NAME=Cocktails

ARG PROJECT_DIR=/${SERVICE_NAME}
# .venv is the default used by poetry when virtualenvs.in-project is set to true
ARG VENV_DIR=${PROJECT_DIR}/.venv

ARG APP_BIND_PORT=8080
ARG APP_BIND_HOST=0.0.0.0

# Stage that prepares the virtualenv for the build and deploy
FROM python:3.14.5 AS virtualenv_preparer

ENV POETRY_VERSION=2.1.1

RUN pip install "poetry==$POETRY_VERSION"

ARG PROJECT_DIR
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

WORKDIR ${PROJECT_DIR}

COPY pyproject.toml .
COPY poetry.lock .


# Create the virtualenv using poetry, it will be created in ${VENV_DIR}
RUN poetry install --only main --no-root


# Stage that prepares the deploy environment
FROM python:3.14.5-slim AS predeploy
ARG PROJECT_DIR
ARG VENV_DIR

WORKDIR ${PROJECT_DIR}

ENV VIRTUAL_ENV=${VENV_DIR}
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY --from=virtualenv_preparer ${VENV_DIR} ${VENV_DIR}


# Stage that builds the python project
FROM virtualenv_preparer AS builder
COPY src ./src
RUN poetry build -f wheel


# Stage that is actually deployed
FROM predeploy AS deploy
ARG PROJECT_DIR
ARG APP_BIND_HOST
ARG APP_BIND_PORT
# ARG UVICORN_WORKERS

ENV APP_BIND_HOST="${APP_BIND_HOST}"
ENV APP_BIND_PORT="${APP_BIND_PORT}"
# ENV UVICORN_WORKERS="${UVICORN_WORKERS}"

WORKDIR ${PROJECT_DIR}

# Install the previously built package

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
# COPY log_conf.json ./log_conf.json
COPY alembic.ini ./alembic.ini
COPY db_admin ./db_admin

COPY src/ .

# COPY --from=builder ${PROJECT_DIR}/dist/*.whl /tmp/

# RUN python -m pip install --no-deps /tmp/*.whl && rm /tmp/*.whl

# Do not run AS root
RUN groupadd -r admin && useradd -m -r -g admin admin
USER admin

EXPOSE ${APP_BIND_PORT}
ENTRYPOINT ["bash", "entrypoint.sh"]

# # command to run on container start
# CMD [ "python", "./cocktails/main.py" ]
# CMD ["uvicorn", "./cocktails/main:app", "--host", "${APP_BIND_HOST}", "--port", ${APP_BIND_PORT}]
