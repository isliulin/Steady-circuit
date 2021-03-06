
// 鼠标焦点物体函数---------------------------------------------------------------

//判断删除物体是否是当前焦点,如果是则清除鼠标焦点物体
//如果deleteBody==null,直接删除焦点
//函数执行在:Manager,DeleteSingleBody,ClearCircuitState
Manager.FocusBodyClear = function(deleteBody) {
	if (deleteBody == null || Manager.focusBody.IsBodySame(deleteBody)) {
		Manager.focusBody.Clear();
	}
};

//设置焦点物体
//函数执行在:FocusBodyPaint,ReadCircuitFromVector,ReadFile
Manager.SetFocusBody = function(newFocus) {
	ASSERT(!newFocus.IsOnConnectPos());
	Manager.focusBody = newFocus.Clone();
};

//画获得鼠标焦点的物体,并覆盖原来的焦点
//如果newFocus==NULL重绘原来焦点;否则覆盖原来的焦点,新的焦点用焦点色画
Manager.FocusBodyPaint = function(newFocus) {
	if (newFocus != null) {	//焦点改变
		if (Manager.focusBody.IsBodySame(newFocus))
			return false;

		//原来的焦点用原色画
		if (Manager.focusBody.IsOnLead())
			Manager.PaintLead(Manager.focusBody.p);
		if (Manager.focusBody.IsOnCrun())
			Manager.PaintCrun(Manager.focusBody.p, false);
		else if (Manager.focusBody.IsOnCtrl())
			Manager.PaintCtrl(Manager.focusBody.p, false);

		//焦点物体更新
		Manager.SetFocusBody(newFocus);
	}

	if (Manager.focusBody.IsOnLead()) {
		switch (Manager.focusLeadStyle) {
		case SOLID_SPECIAL_COLOR:
			Manager.PaintLeadWithStyle(Manager.focusBody.p, 2, COLOR_SPECIAL);
			break;
		case SOLID_ORIGINAL_COLOR:
			Manager.PaintLeadWithStyle(Manager.focusBody.p, 2, Manager.focusBody.p.color);
			break;
		case DOT_SPECIAL_COLOR:
			Manager.PaintLeadWithStyle(Manager.focusBody.p, 1, COLOR_SPECIAL);
			break;
		case DOT_ORIGINAL_COLOR:
			Manager.PaintLeadWithStyle(Manager.focusBody.p, 1, Manager.focusBody.p.color);
			break;
		}
	} else if (Manager.focusBody.IsOnCrun()) {
		Manager.PaintCrunWithStyle(Manager.focusBody.p, PAINT_CRUN_STYLE_FOCUS);
	} else if (Manager.focusBody.IsOnCtrl()) {
		Manager.PaintCtrlWithColor(Manager.focusBody.p, Manager.focusCtrlColor);
	}

	return true;
};

//用户按Tab键切换焦点处理
Manager.FocusBodyChangeUseTab = function() {
	var bodyCount = Manager.crun.length + Manager.ctrl.length;
	var newFocus = new Pointer();
	var num;

	if (bodyCount == 0) return;	//没有物体

	if (Manager.focusBody.IsOnLead()) {	//当前焦点是导线
		num = (Manager.focusBody.p.num + 1) % Manager.lead.length;
		newFocus.SetOnLead(lead[num]);
	} else if (Manager.focusBody.IsOnCrun()) {	//当前焦点是结点
		num = (Manager.focusBody.p.num + 1) % Manager.crun.length;
		newFocus.SetOnCrun(crun[num], true);
	} else if (Manager.focusBody.IsOnCtrl()) {	//当前焦点是控件
		num = (Manager.focusBody.p.num + 1) % Manager.ctrl.length;
		newFocus.SetOnCtrl(ctrl[num], true);
	} else {	//没有设定焦点
		if (Manager.crun.length > 0)
			newFocus.SetOnCrun(crun[0], true);
		else
			newFocus.SetOnCtrl(ctrl[0], true);
	}

	Manager.FocusBodyPaint(newFocus);
};

//用户按上下左右键移动焦点物体
Manager.FocusBodyMove = function(keyCode) {
	Manager.motiCount = 0;
	if (!Manager.focusBody.IsOnBody()) return false;

	//获得物体坐标
	var fromPos = {x:Manager.focusBody.p.x, y:Manager.focusBody.p.y};
	var toPos = ClonePosition(fromPos);

	//设置移动后的坐标
	switch (keyCode) {
	case 38:		//向上移动焦点
		toPos.y -= Manager.moveBodySense;
		break;
	case 40:	//向下移动焦点
		toPos.y += Manager.moveBodySense;
		break;
	case 37:	//向左移动焦点
		toPos.x -= Manager.moveBodySense;
		break;
	case 39:	//向右移动焦点
		toPos.x += Manager.moveBodySense;
		break;
	default:
		return false;
	}

	//检查坐标是否越界
	if (toPos.x < -CTRL_SIZE.cx/2 || toPos.y < -CTRL_SIZE.cy/2) return false;

	//移动对象
	Manager.PosBodyMove(Manager.focusBody, fromPos, toPos);
	return true;
};
