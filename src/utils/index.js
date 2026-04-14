import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MessagePlugin } from "tdesign-vue";

/**
 * 导出本地数据
 * @param {Array} headerJsonList 文件头数据 JSON内需要有key字段对应内容数据
 * @param {Array} valueJsonList 文件内容数据
 * @param {Stirng} fileName 文件名称
 * 参考数据如下
 * headerJsonList: [{name: "姓名",key: "name",},{name: "年龄",key: "age",}]
 * valueJsonList: [{name: "张三",age: "11",},{name: "李四",age: "22",},{name: "王五",age: "33",},]
 */
export function localExportExcel(
  headerJsonList,
  valueJsonList,
  fileName = "默认文件"
) {
  if (Array.isArray(headerJsonList) && headerJsonList.length == 0) {
    this.$message.error("缺少Excel标题数据");
  }
  if (Array.isArray(valueJsonList) && valueJsonList.length == 0) {
    this.$message.error("缺少Excel内容数据");
  }
  let values = [];
  valueJsonList.forEach((v) => {
    let arr = [];
    headerJsonList.forEach((header) => {
      if (v[header.key]) arr.push(v[header.key]);
    });
    values.push(arr);
  });
  const ws = XLSX.utils.aoa_to_sheet([
    headerJsonList.map((o) => o.name),
    ...values,
  ]); // 将数据转换为工作表
  const wb = XLSX.utils.book_new(); // 创建一个新的工作簿
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); // 将工作表添加入工作簿中
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }); //生成excel文件
  saveAs(
    new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}.xlsx`
  );
}

import JSZip from "jszip";

/**
 * 本地下载压缩包
 * @param {*} files 文件源
 * @param {*} fileName 文件名称
 */
export async function downloadLocalZip(files, fileName = "test") {
  const zip = new JSZip();
  await Promise.all(
    files.map((file) => {
      return new Promise((resolve) => {
        zip.file(file.webkitRelativePath, file, {
          createFolders: true,
          streamFiles: true,
        });
        resolve();
      });
    })
  );
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${fileName}.zip`);
}

export const defaultRules = (label = "", trigger = "blur") => {
  const msg = trigger == "blur" ? "请输入" : "请选择";
  return [{ required: true, trigger, message: `${msg}${label}` }];
};

/**
 * 从mgoiy1rueaalu表中ID为1的数据的指定数组中查找特定ID对应的数据项
 * @param {string} arrayFieldName - 数组字段名，如'FeedbackMeetNode-problemList'
 * @param {string} itemId - 要查找的数据项ID
 * @param {Object} $db - 数据库实例
 * @returns {Promise<Object|null>} - 返回找到的数据项，未找到则返回null
 */
export async function findItemInTaskArray(arrayFieldName, itemId, $db) {
  try {
    // 获取当前任务ID对应的表名
    const currentTaskData = await $db.findById('currentTaskId', 1);
    const tableName = currentTaskData?.currentTaskId || '';
    
    if (!tableName) {
      console.error('未找到当前任务ID对应的表名');
      return null;
    }
    
    // 查找mgoiy1rueaalu表中id为1的数据
    const tableData = await $db.findById(tableName, 1);
    if (!tableData) {
      console.error(`未找到表${tableName}中id为1的数据`);
      return null;
    }
    
    // 获取指定数组字段的数据
    const arrayData = tableData[arrayFieldName] || [];
    
    // 在数组中查找指定ID的数据项
    const foundItem = arrayData.find(item => item.id === itemId);
    
    if (foundItem) {
      console.log(`在${arrayFieldName}数组中找到ID为${itemId}的数据项:`, foundItem);
      return foundItem;
    } else {
      console.log(`在${arrayFieldName}数组中未找到ID为${itemId}的数据项`);
      return null;
    }
    
  } catch (error) {
    console.error('查找数据项失败:', error);
    return null;
  }
}

/**
 * 更新mgoiy1rueaalu表中ID为1的数据的指定数组中的特定数据项
 * @param {string} arrayFieldName - 数组字段名，如'FeedbackMeetNode-problemList'
 * @param {string} itemId - 要更新的数据项ID
 * @param {Object} updatedData - 更新后的数据
 * @param {Object} $db - 数据库实例
 * @returns {Promise<boolean>} - 返回是否更新成功
 */
export async function updateItemInTaskArray(arrayFieldName, itemId, updatedData, $db) {
  try {
    // 获取当前任务ID对应的表名
    const currentTaskData = await $db.findById('currentTaskId', 1);
    const tableName = currentTaskData?.currentTaskId || '';
    
    if (!tableName) {
      console.error('未找到当前任务ID对应的表名');
      return false;
    }
    
    // 查找mgoiy1rueaalu表中id为1的数据
    const tableData = await $db.findById(tableName, 1);
    if (!tableData) {
      console.error(`未找到表${tableName}中id为1的数据`);
      return false;
    }
    
    // 获取指定数组字段的数据
    const arrayData = tableData[arrayFieldName] || [];
    
    // 查找要更新的数据项索引
    const itemIndex = arrayData.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.error(`在${arrayFieldName}数组中未找到ID为${itemId}的数据项`);
      return false;
    }
    
    // 更新数据项，保留原有ID和时间戳，更新其他字段
    const updatedItem = {
      ...arrayData[itemIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // 更新数组
    arrayData[itemIndex] = updatedItem;
    
    // 更新数据库
    await $db.update(tableName, 1, {
      [arrayFieldName]: arrayData
    });
    
    console.log(`成功更新${arrayFieldName}数组中ID为${itemId}的数据项`);
    return true;
    
  } catch (error) {
    console.error('更新数据项失败:', error);
    return false;
  }
}


/**
 * 从mgoiy1rueaalu表中ID为1的数据的指定数组中删除指定ID的数据项
 * @param {string} arrayFieldName - 数组字段名，如'FeedbackMeetNode-problemList'
 * @param {string} itemId - 要删除的数据项ID
 * @param {Object} $db - 数据库实例
 * @returns {Promise<boolean>} - 返回是否删除成功
 */
export async function deleteItemFromTaskArray(arrayFieldName, itemId, $db) {
  try {
    // 获取当前任务ID对应的表名
    const currentTaskData = await $db.findById('currentTaskId', 1);
    const tableName = currentTaskData?.currentTaskId || '';
    
    if (!tableName) {
      console.error('未找到当前任务ID对应的表名');
      return false;
    }
    
    // 查找mgoiy1rueaalu表中id为1的数据
    const tableData = await $db.findById(tableName, 1);
    if (!tableData) {
      console.error(`未找到表${tableName}中id为1的数据`);
      return false;
    }
    
    // 获取指定数组字段的数据
    const arrayData = tableData[arrayFieldName] || [];
    
    // 查找要删除的数据项索引
    const itemIndex = arrayData.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.error(`在${arrayFieldName}数组中未找到ID为${itemId}的数据项`);
      return false;
    }
    
    // 从数组中删除数据项
    arrayData.splice(itemIndex, 1);
    
    // 更新数据库
    await $db.update(tableName, 1, {
      [arrayFieldName]: arrayData
    });
    
    console.log(`成功从${arrayFieldName}数组中删除ID为${itemId}的数据项`);
    MessagePlugin.success('删除成功')
    return true;
    
  } catch (error) {
    console.error('删除数据项失败:', error);
    return false;
  }
}

/**
 * 向mgoiy1rueaalu表中ID为1的数据的指定数组中添加新数据项
 * @param {string} arrayFieldName - 数组字段名，如'FeedbackMeetNode-problemList'
 * @param {Object} newData - 要添加的新数据
 * @param {Object} $db - 数据库实例
 * @returns {Promise<boolean>} - 返回是否添加成功
 */
export async function addItemToTaskArray(arrayFieldName, newData, $db) {
  try {
    // 获取当前任务ID对应的表名
    const currentTaskData = await $db.findById('currentTaskId', 1);
    const tableName = currentTaskData?.currentTaskId || '';
    
    if (!tableName) {
      console.error('未找到当前任务ID对应的表名');
      return false;
    }
    
    // 生成唯一ID和时间戳
    const itemId = 'mgo' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    // 准备要添加的数据项
    const itemToAdd = {
      id: itemId,
      ...newData,
      createdAt: now,
      updatedAt: now
    };
    
    // 使用addToArray方法向指定数组添加数据
    await $db.addToArray(tableName, 1, arrayFieldName, itemToAdd);
    
    console.log(`成功向${arrayFieldName}数组添加新数据项，ID: ${itemId}`);
    return true;
    
  } catch (error) {
    console.error('添加数据项失败:', error);
    return false;
  }
}

/**
 * 将mgoiy1rueaalu表中ID为1的数据的源数组数据复制到目标数组，并替换目标数组内容
 * @param {string} sourceArrayField - 源数组字段名，如'FeedbackMeetNode-problemList'
 * @param {string} targetArrayField - 目标数组字段名，如'RectificationPlanNode-fill'
 * @param {Object} $db - 数据库实例
 * @param {boolean} deepCopyData - 是否深拷贝数据，默认为true
 * @returns {Promise<boolean>} - 返回是否复制成功
 */
export async function copyArrayDataToTarget(sourceArrayField, targetArrayField, $db, deepCopyData = true) {
  try {
    // 获取当前任务ID对应的表名
    const currentTaskData = await $db.findById('currentTaskId', 1);
    const tableName = currentTaskData?.currentTaskId || '';
    
    if (!tableName) {
      console.error('未找到当前任务ID对应的表名');
      return false;
    }
    
    // 查找mgoiy1rueaalu表中id为1的数据
    const tableData = await $db.findById(tableName, 1);
    if (!tableData) {
      console.error(`未找到表${tableName}中id为1的数据`);
      return false;
    }
    
    // 获取源数组数据
    const sourceArrayData = tableData[sourceArrayField] || [];
    
    if (!Array.isArray(sourceArrayData)) {
      console.error(`源数组字段${sourceArrayField}不是数组类型`);
      return false;
    }
    
    // 处理数据：深拷贝或浅拷贝
    let targetArrayData;
    if (deepCopyData) {
      targetArrayData = deepCopy(sourceArrayData);
    } else {
      targetArrayData = [...sourceArrayData];
    }
    
    // 更新目标数组字段
    await $db.update(tableName, 1, {
      [targetArrayField]: targetArrayData
    });
    
    console.log(`成功将${sourceArrayField}数组数据复制到${targetArrayField}数组，共${targetArrayData.length}条数据`);
    return true;
    
  } catch (error) {
    console.error('复制数组数据失败:', error);
    return false;
  }
}



/*
 * @description: 深拷贝
 * @param {array,object}
 */
export function deepCopy(source) {
  let result;
  source instanceof Array
    ? (result = [])
    : typeof source === "object"
    ? source === null
      ? (result = null)
      : (result = {})
    : (result = source);
  for (let key in source) {
    result[key] =
      typeof source[key] === "object" ? deepCopy(source[key]) : source[key];
  }
  return result;
}
