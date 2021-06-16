# Setup Terraform

Install a specific version of Terraform CLI in your GitHub Actions workflow.

## Usage

This action can be run on `ubuntu-latest`.

The default configuration installs the latest version of Terraform CLI.
```yaml
steps:
- uses: telia-actions/setup-terraform@v1
```

A specific version of Terraform CLI can be installed by adding semantic version string like `0.15.5`.
```yaml
steps:
- uses: telia-actions/setup-terraform@v1
  with:
    terraform_version: '0.15.5'
```
