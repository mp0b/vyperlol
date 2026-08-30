import paramiko

H, U, P = "72.61.192.44", "root", "QvXEaSSf'w&m6?p+(+3l"
D, DU, DP = "projectvyper-db", "projectvyper-dev", "Pr0jectVyp3r_Fr3kySk1b1d1S1gma_1#2#3#"
DP_ENC = "Pr0jectVyp3r_Fr3kySk1b1d1S1gma_1%232%233%23"
ENV = f"NEXT_PUBLIC_APP_NAME=Vyper\nNEXT_PUBLIC_APP_URL=http://{H}:3000\nAUTH_SECRET=super_secret\nDATABASE_URL=postgresql://{DU}:{DP_ENC}@localhost:5432/{D}?schema=public\nSTORAGE_DRIVER=local\nLOCAL_STORAGE_DIR=./.storage\nUPLOAD_MAX_MB=50\n"

def run(ssh, cmd, log):
    print(f"[*] {log}...")
    _, stdout, _ = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status() # Attend la fin de la commande
    print(f"[+] Terminé: {log}\n")

print("[*] Démarrage de la connexion SSH au VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(H, username=U, password=P)
print("[+] Connecté avec succès !\n")

run(ssh, "apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib", "Mise à jour et installation de PostgreSQL")

sql = f"""DROP DATABASE IF EXISTS "{D}"; DROP ROLE IF EXISTS "{DU}"; CREATE DATABASE "{D}"; CREATE USER "{DU}" WITH PASSWORD '{DP}'; ALTER ROLE "{DU}" SET client_encoding TO 'utf8'; ALTER ROLE "{DU}" SET default_transaction_isolation TO 'read committed'; ALTER ROLE "{DU}" SET timezone TO 'UTC'; GRANT ALL PRIVILEGES ON DATABASE "{D}" TO "{DU}"; ALTER DATABASE "{D}" OWNER TO "{DU}"; GRANT ALL ON SCHEMA public TO "{DU}";"""
run(ssh, f"sudo -u postgres psql <<'EOF'\n{sql}\nEOF", "Nettoyage et Configuration de la base de données et de l'utilisateur")

run(ssh, "mkdir -p /root/vyperlol", "Création du dossier du projet sur le serveur")

print("[*] Génération et transfert du fichier .env...")
sftp = ssh.open_sftp()
with sftp.file('/root/vyperlol/.env', 'w') as f: f.write(ENV)
sftp.close()
print("[+] Fichier .env sauvegardé sur le serveur.\n")

ssh.close()
print("🚀 [SUCCÈS] Toute la configuration VPS est terminée !")
