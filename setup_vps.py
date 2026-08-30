import paramiko
import time

# --- Configuration SSH ---
HOSTNAME = "72.61.192.44"
USERNAME = "root"
PASSWORD = "QvXEaSSf'w&m6?p+(+3l"

# --- Configuration de la base de données ---
DB_NAME = "ProjectVyper"
DB_USER = "ProjectVyper"
DB_PASS = "ProjectVyper_FreakySkibidiStrawberry_1#2#3" # Tu peux changer ce mot de passe

# --- Fichier .env ---
ENV_CONTENT = f"""NEXT_PUBLIC_APP_NAME=Vyper
NEXT_PUBLIC_APP_URL=http://{HOSTNAME}:3000
AUTH_SECRET=super_secret_auth_token_a_changer
DATABASE_URL=postgresql://{DB_USER}:{DB_PASS}@localhost:5432/{DB_NAME}?schema=public
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=./.storage
UPLOAD_MAX_MB=50
"""

def run_command(ssh, command, description):
    print(f"[*] {description}...")
    stdin, stdout, stderr = ssh.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    
    if exit_status == 0:
        print("[+] Succès.")
    else:
        print(f"[-] Erreur:\n{stderr.read().decode().strip()}")
        
def main():
    print("Début de la configuration du VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connexion à {USERNAME}@{HOSTNAME}...")
        ssh.connect(hostname=HOSTNAME, username=USERNAME, password=PASSWORD)
        print("[+] Connecté avec succès !")

        # 1. Mise à jour et installation de PostgreSQL
        run_command(ssh, "apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib", "Installation de PostgreSQL")

        # 2. Configuration de la base de données
        commands = [
            f"CREATE DATABASE {DB_NAME};",
            f"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASS}';",
            f"ALTER ROLE {DB_USER} SET client_encoding TO 'utf8';",
            f"ALTER ROLE {DB_USER} SET default_transaction_isolation TO 'read committed';",
            f"ALTER ROLE {DB_USER} SET timezone TO 'UTC';",
            f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};",
            f"ALTER DATABASE {DB_NAME} OWNER TO {DB_USER};",
            f"GRANT ALL ON SCHEMA public TO {DB_USER};"
        ]
        
        for cmd in commands:
            psql_command = f"""sudo -u postgres psql -c "{cmd}" """
            run_command(ssh, psql_command, f"Exécution SQL: {cmd[:30]}...")

        # 3. Création du dossier du projet et du fichier .env
        print("[*] Création du fichier .env...")
        ssh.exec_command("mkdir -p /root/vyperlol")
        
        sftp = ssh.open_sftp()
        with sftp.file('/root/vyperlol/.env', 'w') as f:
            f.write(ENV_CONTENT)
        sftp.close()
        print("[+] Fichier /root/vyperlol/.env créé avec succès.")

        print("\n[+] Toute la configuration est terminée !")

    except Exception as e:
        print(f"[-] Une erreur est survenue : {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
