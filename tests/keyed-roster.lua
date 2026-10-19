do
  local saved = InCombatLockdown
  local locked = false
  InCombatLockdown = function() return locked end
  local Each = __wuiraModules.require('ui.ForEach').ForEach
  local observer,stops,created,disposed = nil,0,0,0
  local source = {Value={{key='A'},{key='B'}}}
  function source:onChange(listener)
    observer=listener
    return function() observer=nil;stops=stops+1 end
  end
  local records,refs = {},{}
  local view = factory(nil,Each,{
    items=source,key=function(_,item) return item.key end,wrapAfter=2,gap=2,lineGap=4,
    onUpdate=function(_,view,item) refs[view].key=item.key end,
    onDispose=function(_,view) disposed=disposed+1;refs[view]=nil end
  },function(_,item)
    created=created+1
    local record={key=item.key}
    local view=factory(nil,'cell',{width=40,height=10,onMount=function(_,frame) record.frame=frame end})
    records[item.key]=record;refs[view]=record
    return view
  end)
  local root=API.Mount(nil,view)
  local a,b=records.A,records.B
  assert(created==2 and root.width==40 and root.height==22)
  assert(a.frame and b.frame and b.frame.y==-12)
  local allocated=#nativeFrames
  local function update(items)
    source.Value=items;observer(nil,items)
  end
  update({{key='B'},{key='A'}})
  assert(records.A==a and records.B==b and #nativeFrames==allocated and created==2)
  assert(a.frame.y==-12 and b.frame.y==0)
  update({{key='B'},{key='A'},{key='C'}})
  assert(created==3 and root.width==84 and records.C.frame.x==44)
  local c=records.C
  locked=true
  update({{key='A'},{key='C'}})
  assert(created==3 and disposed==0 and b.frame.shown)
  locked=false;emit('PLAYER_REGEN_ENABLED')
  assert(disposed==1 and not b.frame.shown)
  assert(records.A==a and records.C==c and root.width==40)
  assert(not pcall(update,{{key='A'},{key='A'}}),'duplicate keys rejected')
  API.Unmount(nil,root)
  assert(stops==1 and observer==nil and disposed==3 and not a.frame.shown and not c.frame.shown)
  InCombatLockdown = saved
end
