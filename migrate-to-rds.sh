#!/bin/bash
# Script to migrate the database to RDS by applying init SQL scripts
ENV_FILE=".env"

# Extract the DATABASE_URL line for RDS
RDS_URL=$(grep -E '^#?\s*DATABASE_URL=postgresql://' "$ENV_FILE" | grep 'rds.amazonaws.com' | tail -1 | cut -d '=' -f2- | tr -d '"')

if [ -z "$RDS_URL" ]; then
  echo "❌ RDS DATABASE_URL not found in $ENV_FILE"
  exit 1
fi

# Parse the DATABASE_URL
proto_removed="${RDS_URL#postgresql://}"
USER_PASS_HOST_DB=$(echo "$proto_removed" | sed 's/\// /g')
USER_PASS_HOST=$(echo "$USER_PASS_HOST_DB" | awk '{print $1}')
DB_NAME=$(echo "$USER_PASS_HOST_DB" | awk '{print $2}')

USER=$(echo "$USER_PASS_HOST" | cut -d':' -f1)
PASS_HOST=$(echo "$USER_PASS_HOST" | cut -d':' -f2-)
PASS=$(echo "$PASS_HOST" | cut -d'@' -f1)
HOST_PORT=$(echo "$PASS_HOST" | cut -d'@' -f2)
HOST=$(echo "$HOST_PORT" | cut -d':' -f1)
PORT=$(echo "$HOST_PORT" | cut -d':' -f2)

export PGPASSWORD="$PASS"

echo "Connecting to $DB_NAME on $HOST:$PORT as $USER"

# Drop schemas (and all tables in them)
# echo "Dropping schemas auth, patient, clinical, \"group\", billing (CASCADE)..."
# psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB_NAME" <<EOF
# DROP SCHEMA IF EXISTS auth CASCADE;
# DROP SCHEMA IF EXISTS patient CASCADE;
# DROP SCHEMA IF EXISTS clinical CASCADE;
# DROP SCHEMA IF EXISTS "group" CASCADE;
# DROP SCHEMA IF EXISTS billing CASCADE;
# EOF

# Apply init scripts
# echo "Applying init scripts..."
# for f in database/init/*.sql; do
#   echo "Applying $f ..."
#   psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB_NAME" -f "$f"
#   if [ $? -ne 0 ]; then
#     echo "❌ Error applying $f"
#     exit 1
#   fi
# done
# echo "✅ All init scripts applied successfully!"


# Apply migration scripts
echo "Applying migration scripts..."
for f in database/migrations/*.sql; do
  echo "Applying $f ..."
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB_NAME" -f "$f"
  if [ $? -ne 0 ]; then
    echo "❌ Error applying $f"
    exit 1
  fi
done
echo "✅ All migration scripts applied successfully!"

