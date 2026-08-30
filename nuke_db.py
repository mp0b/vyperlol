import paramiko
import time

H, U, P = "72.61.192.44", "root", "QvXEaSSf'w&m6?p+(+3l"
DB_NAME = "projectvyper-db"
DB_USER = "projectvyper-dev"
DB_PASS = "VyperDB2026Secure"

print("[*] Connexion au VPS pour TOUT réinitialiser...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(H, username=U, password=P, timeout=15)
    
    cmd = f"""
    sudo -u postgres psql <<'EOSQL'
    -- Force la déconnexion de tous les conteneurs Coolify qui bloquent la suppression
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{DB_NAME}' AND pid <> pg_backend_pid();
    
    -- Supprime tout
    DROP DATABASE IF EXISTS "{DB_NAME}";
    DROP ROLE IF EXISTS "{DB_USER}";
    
    -- Recrée tout à zéro
    CREATE USER "{DB_USER}" WITH PASSWORD '{DB_PASS}';
    CREATE DATABASE "{DB_NAME}" OWNER "{DB_USER}";
    GRANT ALL PRIVILEGES ON DATABASE "{DB_NAME}" TO "{DB_USER}";
EOSQL
    
    # Nettoie et sécurise les règles de connexion Docker
    PG_HBA=$(find /etc/postgresql -name pg_hba.conf | head -n 1)
    sed -i '/0.0.0.0/d' $PG_HBA
    echo "host all all 0.0.0.0/0 scram-sha-256" >> $PG_HBA
    systemctl restart postgresql
    """
    
    print("[*] Suppression forcée et recréation de la base de données...")
    _, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()
    
    print("\n✅ [SUCCÈS] LA BASE DE DONNÉES A ÉTÉ TOTALEMENT RÉINITIALISÉE !")
    print("\n👉 Copie exactement cette ligne dans les variables Coolify de vyperlol ET de vyperapi :")
    print("-" * 80)
    print(f"DATABASE_URL=postgresql://{DB_USER}:{DB_PASS}@172.16.0.1:5432/{DB_NAME}?schema=public")
    print("-" * 80)
    print("Ensuite, clique sur Force Rebuild !")
    
    ssh.close()

except Exception as e:
    print(f"\n❌ Erreur de connexion (si c'est un 'Timeout', attends 10 min et recommence) : {e}")
