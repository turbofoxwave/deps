const readdir = require('recursive-readdir')
const _ =       require('lodash')
module.exports = class Deps{

  static ignore(file,stats){
    return (stats.isDirectory() && file.includes('node_modules')) || (! stats.isDirectory() && !file.match(/[/\\]{0,1}package\.json/))
  }

  static async getPackagesAsync(path){
    let files = await readdir(path, [function ignore(file, stats){
      let shouldIgnore = Deps.ignore(file, stats)
      return shouldIgnore
    }])

    return files
  }

  static async loadPackagesAsync(path){
    let files = await Deps.getPackagesAsync(path)
    let packages = []
    for(let f = 0 ; f < files.length; f++){
      let file = files[f]
      packages.push( require(file) )
    }


    //apply dep analysis to sort list.

    packages.sort( function(a, b){

      let isBinADeps = _.find(a.dependencies, function(val,key){
        return key === b.name
      })

      isBinADeps = isBinADeps || _.find(a.devDependencies, function(val, key){
        return key === b.name
      })


      let isAInBDeps = _.find(b.dependencies, function(val, key){
        return key === a.name
      })

      isAInBDeps = isAInBDeps || _.find(b.devDependencies, function(val, key){
        return key === a.name
      })

      if(isAInBDeps && isBinADeps){
        throw new Error("circular dependency")
      }

      if(isBinADeps){
        return 1
      }


      if(isAInBDeps){
        return -1
      }

      return 0

    })


    return packages
  }

}