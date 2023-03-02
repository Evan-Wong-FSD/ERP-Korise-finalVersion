const updateMaterialsInformRequested = (state, value) => {
  const { materialsInformRequested } = state
  materialsInformRequested.push(...value)
}

export {
  updateMaterialsInformRequested
}
