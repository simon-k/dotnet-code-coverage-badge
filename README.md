![Build](https://github.com/simon-k/dotnet-code-coverage-badge/workflows/CI/badge.svg?branch=main)
[![license](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
![semver](https://img.shields.io/badge/semver-2.0.0-blue)
[![market](https://img.shields.io/badge/Get_it-on_the_Marketplace-informational.svg)](https://github.com/marketplace/actions/dotnet-code-coverage-badge)

When using this action you'll get a badge like this:
![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/simon-k/7b6fcd8cecf36e9cc83276540e9f2867/raw/code-coverage.json)

# .NET Code Coverage Badge
This action allows you to create badges for your README.md, with shields.io, which will show the code coverage percentage. This action does not need to push anything to your repository - it will use a gist instead. 

## Table of Content
   * [How it Works](#how-it-works)
   * [Requirements](#requirements)
   * [Inputs](#inputs)
   * [Outputs](#outputs)
   * [Example Usage](#example-usage)
   * [Step-by-step Guide](#step-by-step-guide)
      * [Create Gist](#create-gist)
      * [Configure Workflow](#configure-workflow)
      * [Update Your Readme](#update-your-readme)
   * [Contributing to .NET Code Coverage Badge](#contributing-to-.net-code-coverage-badge)
     * [Bugs and Features](#bugs-and-features)
     * [Update the Sourceode](#update-the-sourceode)
     * [Versioning and Releases](#versioning-and-releases)
   * [Notes](#notes)

## How it Works
This action reads a code coverage report in opencover format. For example generated by the Coverlet package for .NET. Then it generates the shield.io data, and if 
a gist secret and filename is give, then the shields.io 

## Requirements
For this action to work there must be an opencover.xml file available in the workflow and a path to it must be specified as an input parameter.

Making this opencover.xml in .NET is really simple. All you need to do is to install the nuget package ```coverlet.msbuild``` and it's dependency ```coverlet.collector``` in your test project. Then you can generate the test coverage file during your test execution with this command:

```
dotnet test  -p:CollectCoverage=true -p:CoverletOutput=TestResults/ -p:CoverletOutputFormat=opencover
```

The above command will generate an opencover report in ```TestResults/coverage.opencover.xml```. 

You don't necessarily have to use the above example to generate the opencover report. If you have other means of doing this, then that should not cause any problems. You actually don't even need a .NET solution. As long as you can provide a path for the coverage file. 

## Inputs
| Name            | Required  | Description |
| --------------- |:---------:| ------------|
| label           | Optional  | The badge label. For example "Unit Test Coverage". Default value is "Test Coverage" |
| color           | Optional  | The color of the badge. See https://shields.io/ for options. Default value is brightgreen |
| path            | Required  | The path to the opencover.xml file |
| gist-filename   | Optional  | Filename of the Gist used for storing the badge data |
| gist-id         | Optional  | ID if the Gist used for storing the badge data |
| gist-auth-token | Optional  | Auth token that alows to write to the given Gist |

## Outputs
| Name            | Description |
| --------------- | ------------|
| percentage      | The code coverage percentage extracted from the file in the provided path |
| badge           | The badge data as in json format as required by shields.io |

## Example Usage
Below is a snippet of a typical .NET workflow that will restore dependencies, build solution and run unit tests. After those actions the .NET Code Coverage Badge will be generated and the ```percentage``` printet to the workflow log. If you copy-paste this, be sure to rename the ```<MyProject>``` and adjust tje ```gist-filename```, ```gist-id``` and ```gist-auth-token``` to your configuration.

```
name: Unit Test With Coverage
on:
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: 3.1.301
    - name: Restore dependencies
      run: dotnet restore   
    - name: Build
      run: dotnet build --no-restore
    - name: Test
      run: dotnet test  -p:CollectCoverage=true -p:CoverletOutput=TestResults/ -p:CoverletOutputFormat=opencover --no-build --verbosity normal <MyProject>.Tests/
    - name: Create Test Coverage Badge
      uses: simon-k/dotnet-code-coverage-badge@v1.0.0
      id: create_coverage_badge
      with:
        label: Unit Test Coverage
        color: brightgreen
        path: <MyProject>.Tests/TestResults/coverage.opencover.xml
        gist-filename: code-coverage.json
        gist-id: 1234567890abcdef1234567890abcdef
        gist-auth-token: ${{ secrets.GIST_AUTH_TOKEN }}       
    - name: Print code coverage
      run: echo "Code coverage percentage ${{steps.create_coverage_badge.outputs.percentage}}%"
```

## Step-by-step Guide
### Create Gist
1. Go to [gist.github.com](https://gist.github.com/)
2. Create a new gist, and name the file something like ```code-coverage.json```
3. Save the filename and the Gist ID (the long alphanumerical part of its URL). You'll need those later.

![Gist File](/documentation/gist-step-1.png)

4. Navigate to the [GitHub Developer Settings](https://github.com/settings/tokens) and create a new token with the gist scope. Save the token for later. NOTE: This must be done with the same user account that created the gist. And it is needed for the workflow to be able to update the Gist.

![Gist Token](/documentation/gist-step-2.png)

4. Go to the Secrets page of the settings of the repository running the workflow
5. Create a new repository secret, containing the token from step 4. Name it something like ```GIST_AUTH_TOKEN```.

![Repo Secret](/documentation/gist-step-3.png)

### Configure Workflow
1. TODO: Describe steps

### Update Your Readme
Once the workflow is executed, got to your gist and make sure that the content of this file now contains the badge data.
Embed the badge in your README like this:

```
![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/<user>/<gist-id>/raw/<gist-filename>)
```

The ```<user>``` is the user who owns the gist.


## Contributing to .NET Code Coverage Badge
### Bugs and Features
If you encounter a bug or want to suggest a new feature, then create a [GitHib Issue](https://github.com/simon-k/dotnet-code-coverage-badge/issues).

### Update the Sourceode
We are happy to receive contributions in the form of pull requests via Github. Feel free to branch the repository, implement your changes and create a pull request to the main branch.

### Versioning and Releases
We are using [semver](https://semver.org/). 
New releases are made by tagging the main branch.

## Notes
* The coverage report must be stored in ```utf8``` encoding
* You don't have to provide the gist parameters if you do not want to store the badge data in gist. You can use the output parameter ```badge``` if you want to store the badge in some other way.
