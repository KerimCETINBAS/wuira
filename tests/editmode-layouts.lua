do
  local GetLayouts = __wuiraModules.require('datasources.NativeApi').GetLayouts
  C_EditMode = nil
  assert(not pcall(function() return new(GetLayouts).Value end))
  local data = { activeLayout = 2, layouts = { { layoutName = 'Raid' }, { layoutName = 'Solo' } } }
  local reads = 0
  C_EditMode = { GetLayouts = function() reads = reads + 1; return data end }
  local source = new(GetLayouts)
  local snapshot = source.Value
  assert(snapshot.activeLayout == 2 and snapshot.layouts[1].layoutName == 'Raid' and reads >= 1)
  local before = reads
  assert(source.Value.layouts[2].layoutName == 'Solo' and reads == before + 1)
  data = { secret = true }
  assert(source:IsSecret() and not pcall(function() return source.Value end))
  C_EditMode = nil
end
