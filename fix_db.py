import paramiko

H, U, P = "72.61.192.44", "root", "QvXEaSSf'w&m6?p+(+3l"
DU = "projectvyper-dev"
DP = "Pr0jectVyp3r_Fr3kySk1b1d1S1gma_1#2#3#"

print("[*] Connexion SSH au VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(H, username=U, password=P, timeout=15)
    print("[+] Connecté avec succès !\n")

    commands = [
        f"sudo -u postgres psql -c \"ALTER USER \\\"{DU}\\\" WITH PASSWORD '{DP}';\"",
        "PG_HBA=$(find /etc/postgresql -name pg_hba.conf | head -n 1) && sed -i '/0.0.0.0/d' $PG_HBA",
        "PG_HBA=$(find /etc/postgresql -name pg_hba.conf | head -n 1) && echo 'host all all 0.0.0.0/0 scram-sha-256' >> $PG_HBA",
        "systemctl restart postgresql"
    ]

    for cmd in commands:
        print(f"[*] Exécution...")
        _, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()
        print("[+] Fait.\n")

    ssh.close()
    print("🚀 [SUCCÈS] Base de données réparée ! Relance ton déploiement Coolify.")
except Exception as e:
    print(f"❌ Erreur: {e}")
