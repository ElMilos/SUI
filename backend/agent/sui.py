import subprocess

def vote_on_proposal(proposal_id, vote="yes"):
cmd = [
"sui",
"client",
"call",
"--package", "<DAO_PACKAGE_ID>",
"--module", "dao",
"--function", "vote",
"--args", proposal_id, vote,
"--gas-budget", "10000000",
"--signer", os.getenv("SUI_ACCOUNT")
]
subprocess.run(cmd)