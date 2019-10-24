const assert = require('chai').assert
const deps = require('../index.js')
describe("deps core functionality - ", function(){
  it("finds only package.json files", async function(){
    let files = await deps.getPackagesAsync(__dirname+"/example")
    assert.strictEqual(files.length, 3)
  })

  it("loads package objects in dep order", async function(){
    let packages = await deps.loadPackagesAsync(__dirname+"/example")
    assert.strictEqual(packages.length, 3)

    assert.strictEqual(packages[0].package.name, 'a')
    assert.strictEqual(packages[1].package.name, 'b')
    assert.strictEqual(packages[2].package.name, 'c')

  })

  it("will throw circular deps error", async function(){
    try{
      let packages = await deps.loadPackagesAsync(__dirname+"/example-circular")
      throw new Error("should have thrown an error")
    } catch(err){
      assert.include(err.message, "circular dependency")
      return
    }
  })


})