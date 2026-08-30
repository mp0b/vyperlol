import paramiko

H, U, P = "72.61.192.44", "root", "QvXEaSSf'w&m6?p+(+3l"
D, DU, DP = "vyper", "vyper_admin", "vyper_db_password_123"
ENV = f"NEXT_PUBLIC_APP_NAME=Vyper\nNEXT_PUBLIC_APP_URL=http://{H}:3000\nAUTH_SECRET=super_secret\nDATABASE_URL=postgresql://{DU}:{DP}@localhost:5432/{D}?schema=public\nSTORAGE_DRIVER=local\nLOCAL_STORAGE_DIR=./.storage\nUPLOAD_MAX_MB=50\n"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(H, username=U, password=P)

ssh.exec_command("apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib")
sql = f"CREATE DATABASE {D}; CREATE USER {DU} WITH PASSWORD '{DP}'; ALTER ROLE {DU} SET client_encoding TO 'utf8'; ALTER ROLE {DU} SET default_transaction_isolation TO 'read committed'; ALTER ROLE {DU} SET timezone TO 'UTC'; GRANT ALL PRIVILEGES ON DATABASE {D} TO {DU}; ALTER DATABASE {D} OWNER TO {DU}; GRANT ALL ON SCHEMA public TO {DU};"
ssh.exec_command(f"sudo -u postgres psql -c \"{sql}\"")

ssh.exec_command("mkdir -p /root/vyperlol")
sftp = ssh.open_sftp()
with sftp.file('/root/vyperlol/.env', 'w') as f: f.write(ENV)
sftp.close()
ssh.close()
print("Configuration terminée avec succès.")
