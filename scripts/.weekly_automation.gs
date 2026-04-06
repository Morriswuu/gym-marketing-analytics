function importFromBigQuery() {
  var projectId = 'gym-project-491908';
  
  var job = {
    configuration: {
      query: {
        query: 'SELECT * FROM `gym-project-491908.gymmember.weekly_summary`',
        useLegacySql: false
      }
    }
  };

  var jobResult = BigQuery.Jobs.insert(job, projectId);
  var jobId = jobResult.jobReference.jobId;
  
  // 等待查詢完成
  var sleepTimeMs = 500;
  while (jobResult.status.state !== 'DONE') {
    Utilities.sleep(sleepTimeMs);
    jobResult = BigQuery.Jobs.get(projectId, jobId);
  }

  var results = BigQuery.Jobs.getQueryResults(projectId, jobId);
  var rows = results.rows;
  var fields = results.schema.fields;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('工作表1');
  sheet.clearContents();

  var headers = fields.map(function(f) { return f.name; });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  var data = rows.map(function(row) {
    return row.f.map(function(cell) { return cell.v; });
  });
  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  
  Logger.log('完成，共寫入 ' + data.length + ' 筆資料');
}


function checkAndAlert() {
  var projectId = 'gym-project-491908';
  
  var job = {
    configuration: {
      query: {
        query: 'SELECT workout_type, avg_calories FROM `gym-project-491908.gymmember.weekly_summary` WHERE avg_calories < 900',
        useLegacySql: false
      }
    }
  };

  var jobResult = BigQuery.Jobs.insert(job, projectId);
  var jobId = jobResult.jobReference.jobId;
  
  while (jobResult.status.state !== 'DONE') {
    Utilities.sleep(500);
    jobResult = BigQuery.Jobs.get(projectId, jobId);
  }

  var results = BigQuery.Jobs.getQueryResults(projectId, jobId);
  var rows = results.rows;

  if (rows && rows.length > 0) {
    var message = '⚠️ 預警通知\n\n以下運動類型的平均卡路里低於 900：\n\n';
    rows.forEach(function(row) {
      message += '· ' + row.f[0].v + '：' + row.f[1].v + ' kcal\n';
    });
    
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: '【Gym Dashboard 預警】avg_calories 異常',
      body: message
    });
    
    Logger.log('預警信已寄出');
  } else {
    Logger.log('所有指標正常，無需預警');
  }
}


function generateWeeklySlides() {
  var slideId = '1Hb5fLtwJY2yGJot8jHPHCDZHpqSEB6G9Olm5reAtSdw';
  var presentation = SlidesApp.openById(slideId);
  var slide = presentation.getSlides()[0];
  var shapes = slide.getShapes();
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('工作表1');
  var data = sheet.getDataRange().getValues();
  
  var summary = {};
  var totalCount = 0;
  for (var i = 1; i < data.length; i++) {
    var type = data[i][0];
    summary[type] = {
      calories: data[i][3],
      count: data[i][6]
    };
    totalCount += Number(data[i][6]);
  }
  
  var topGroup = Object.keys(summary).reduce(function(a, b) {
    return summary[a].calories > summary[b].calories ? a : b;
  });
  
  var today = new Date();
  var week = Utilities.formatDate(today, 'Asia/Taipei', 'yyyy-MM-dd');
  
  shapes.forEach(function(shape) {
    var textRange = shape.getText();
    var text = textRange.asString();
    
    text = text.replace('{{week}}', week);
    text = text.replace('{{member_count}}', totalCount);
    text = text.replace('{{hiit_calories}}', summary['HIIT'] ? summary['HIIT'].calories : 'N/A');
    text = text.replace('{{cardio_calories}}', summary['Cardio'] ? summary['Cardio'].calories : 'N/A');
    text = text.replace('{{top_group}}', topGroup);
    
    textRange.setText(text);
  });
  
  Logger.log('週報已更新：' + week);
}
