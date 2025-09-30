# CloudWatch Alarm Examples

This document provides comprehensive examples of CloudWatch alarms that can be translated to Grafana alerts using this tool. Each example includes the JSON format for the translator and the AWS CLI command to create the alarm.

## Table of Contents

- [EC2 Alarms](#ec2-alarms)
- [RDS Alarms](#rds-alarms)
- [ELB Alarms](#elb-alarms)
- [S3 Alarms](#s3-alarms)
- [Lambda Alarms](#lambda-alarms)
- [CloudWatch Logs Alarms](#cloudwatch-logs-alarms)
- [Custom Metrics](#custom-metrics)

---

## EC2 Alarms

### High CPU Utilization

**Description**: Alert when EC2 instance CPU utilization exceeds 80% for 2 consecutive periods.

**JSON for Translator**:
```json
{
  "alarmName": "HighCPUUtilization",
  "metricName": "CPUUtilization",
  "namespace": "AWS/EC2",
  "statistic": "Average",
  "period": 300,
  "threshold": 80.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPUUtilization" \
  --alarm-description "Alert when CPU utilization exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

### High Memory Utilization

**Description**: Alert when EC2 instance memory utilization exceeds 85% for 3 consecutive periods.

**JSON for Translator**:
```json
{
  "alarmName": "HighMemoryUtilization",
  "metricName": "MemoryUtilization",
  "namespace": "AWS/EC2",
  "statistic": "Average",
  "period": 300,
  "threshold": 85.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 3,
  "datapointsToAlarm": 3,
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "HighMemoryUtilization" \
  --alarm-description "Alert when memory utilization exceeds 85%" \
  --metric-name MemoryUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 85.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 3 \
  --datapoints-to-alarm 3
```

### High Network In

**Description**: Alert when network traffic in exceeds 1GB in 5 minutes.

**JSON for Translator**:
```json
{
  "alarmName": "HighNetworkIn",
  "metricName": "NetworkIn",
  "namespace": "AWS/EC2",
  "statistic": "Sum",
  "period": 300,
  "threshold": 1073741824,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "HighNetworkIn" \
  --alarm-description "Alert when network traffic in exceeds 1GB" \
  --metric-name NetworkIn \
  --namespace AWS/EC2 \
  --statistic Sum \
  --period 300 \
  --threshold 1073741824 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

---

## RDS Alarms

### High Database CPU

**Description**: Alert when RDS database CPU utilization exceeds 75% for 2 consecutive periods.

**JSON for Translator**:
```json
{
  "alarmName": "RDSHighCPU",
  "metricName": "CPUUtilization",
  "namespace": "AWS/RDS",
  "statistic": "Average",
  "period": 300,
  "threshold": 75.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "DBInstanceIdentifier", "Value": "my-db-instance"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "RDSHighCPU" \
  --alarm-description "Alert when RDS CPU utilization exceeds 75%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 75.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=my-db-instance \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

### Low Free Storage Space

**Description**: Alert when RDS free storage space drops below 2GB.

**JSON for Translator**:
```json
{
  "alarmName": "RDSLowStorage",
  "metricName": "FreeStorageSpace",
  "namespace": "AWS/RDS",
  "statistic": "Minimum",
  "period": 300,
  "threshold": 2147483648,
  "comparisonOperator": "LessThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "DBInstanceIdentifier", "Value": "my-db-instance"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "RDSLowStorage" \
  --alarm-description "Alert when RDS free storage space drops below 2GB" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Minimum \
  --period 300 \
  --threshold 2147483648 \
  --comparison-operator LessThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=my-db-instance \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

### High Database Connections

**Description**: Alert when database connections exceed 80% of maximum connections.

**JSON for Translator**:
```json
{
  "alarmName": "RDSHighConnections",
  "metricName": "DatabaseConnections",
  "namespace": "AWS/RDS",
  "statistic": "Average",
  "period": 300,
  "threshold": 80.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "DBInstanceIdentifier", "Value": "my-db-instance"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "RDSHighConnections" \
  --alarm-description "Alert when database connections exceed 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=my-db-instance \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

---

## ELB Alarms

### High Latency

**Description**: Alert when ELB latency exceeds 1 second for 2 consecutive periods.

**JSON for Translator**:
```json
{
  "alarmName": "ELBHighLatency",
  "metricName": "Latency",
  "namespace": "AWS/ELB",
  "statistic": "Average",
  "period": 300,
  "threshold": 1.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "LoadBalancerName", "Value": "my-load-balancer"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "ELBHighLatency" \
  --alarm-description "Alert when ELB latency exceeds 1 second" \
  --metric-name Latency \
  --namespace AWS/ELB \
  --statistic Average \
  --period 300 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancerName,Value=my-load-balancer \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

### High 5xx Errors

**Description**: Alert when 5xx error rate exceeds 5% of total requests.

**JSON for Translator**:
```json
{
  "alarmName": "ELBHigh5xxErrors",
  "metricName": "HTTPCode_ELB_5XX_Count",
  "namespace": "AWS/ELB",
  "statistic": "Sum",
  "period": 300,
  "threshold": 10.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "LoadBalancerName", "Value": "my-load-balancer"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "ELBHigh5xxErrors" \
  --alarm-description "Alert when 5xx error rate exceeds 5%" \
  --metric-name HTTPCode_ELB_5XX_Count \
  --namespace AWS/ELB \
  --statistic Sum \
  --period 300 \
  --threshold 10.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancerName,Value=my-load-balancer \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

---

## S3 Alarms

### High 4xx Errors

**Description**: Alert when S3 bucket returns more than 10 4xx errors in 5 minutes.

**JSON for Translator**:
```json
{
  "alarmName": "S3-4xxErrors-Alarm",
  "metricName": "4xxErrors",
  "namespace": "AWS/S3",
  "statistic": "Sum",
  "period": 300,
  "threshold": 10.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "BucketName", "Value": "my-example-bucket"},
    {"Name": "StorageType", "Value": "AllStorageTypes"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "S3-4xxErrors-Alarm" \
  --alarm-description "Alarm when S3 bucket returns more than 10 4xx errors in 5 minutes" \
  --metric-name 4xxErrors \
  --namespace AWS/S3 \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=BucketName,Value=my-example-bucket Name=StorageType,Value=AllStorageTypes \
  --evaluation-periods 1 \
  --treat-missing-data notBreaching
```

### High Bucket Size

**Description**: Alert when S3 bucket size exceeds 100GB.

**JSON for Translator**:
```json
{
  "alarmName": "S3HighBucketSize",
  "metricName": "BucketSizeBytes",
  "namespace": "AWS/S3",
  "statistic": "Average",
  "period": 86400,
  "threshold": 107374182400,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "BucketName", "Value": "my-example-bucket"},
    {"Name": "StorageType", "Value": "StandardStorage"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "S3HighBucketSize" \
  --alarm-description "Alert when S3 bucket size exceeds 100GB" \
  --metric-name BucketSizeBytes \
  --namespace AWS/S3 \
  --statistic Average \
  --period 86400 \
  --threshold 107374182400 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=BucketName,Value=my-example-bucket Name=StorageType,Value=StandardStorage \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

---

## Lambda Alarms

### High Error Rate

**Description**: Alert when Lambda function error rate exceeds 5% for 2 consecutive periods.

**JSON for Translator**:
```json
{
  "alarmName": "LambdaHighErrorRate",
  "metricName": "Errors",
  "namespace": "AWS/Lambda",
  "statistic": "Sum",
  "period": 300,
  "threshold": 5.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "FunctionName", "Value": "my-lambda-function"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "LambdaHighErrorRate" \
  --alarm-description "Alert when Lambda error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=my-lambda-function \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

### High Duration

**Description**: Alert when Lambda function duration exceeds 10 seconds.

**JSON for Translator**:
```json
{
  "alarmName": "LambdaHighDuration",
  "metricName": "Duration",
  "namespace": "AWS/Lambda",
  "statistic": "Average",
  "period": 300,
  "threshold": 10000.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "FunctionName", "Value": "my-lambda-function"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "LambdaHighDuration" \
  --alarm-description "Alert when Lambda duration exceeds 10 seconds" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 10000.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=my-lambda-function \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

---

## CloudWatch Logs Alarms

### High Error Log Count

**Description**: Alert when error log count exceeds 50 in 5 minutes.

**JSON for Translator**:
```json
{
  "alarmName": "LogsHighErrorCount",
  "metricName": "IncomingLogEvents",
  "namespace": "AWS/Logs",
  "statistic": "Sum",
  "period": 300,
  "threshold": 50.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 1,
  "datapointsToAlarm": 1,
  "dimensions": [
    {"Name": "LogGroupName", "Value": "/aws/lambda/my-function"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "LogsHighErrorCount" \
  --alarm-description "Alert when error log count exceeds 50" \
  --metric-name IncomingLogEvents \
  --namespace AWS/Logs \
  --statistic Sum \
  --period 300 \
  --threshold 50.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LogGroupName,Value=/aws/lambda/my-function \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

---

## Custom Metrics

### Application Response Time

**Description**: Alert when custom application response time exceeds 2 seconds.

**JSON for Translator**:
```json
{
  "alarmName": "AppHighResponseTime",
  "metricName": "ResponseTime",
  "namespace": "MyApplication",
  "statistic": "Average",
  "period": 300,
  "threshold": 2000.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "Environment", "Value": "Production"},
    {"Name": "Service", "Value": "API"}
  ]
}
```

**AWS CLI Command**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "AppHighResponseTime" \
  --alarm-description "Alert when application response time exceeds 2 seconds" \
  --metric-name ResponseTime \
  --namespace MyApplication \
  --statistic Average \
  --period 300 \
  --threshold 2000.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Environment,Value=Production Name=Service,Value=API \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2
```

---

## Usage Tips

### Converting CLI Commands to JSON

When converting AWS CLI commands to JSON format for the translator:

1. **Extract the parameters** from the CLI command
2. **Convert dimensions** from CLI format to JSON array format:
   - CLI: `Name=InstanceId,Value=i-1234567890abcdef0`
   - JSON: `[{"Name": "InstanceId", "Value": "i-1234567890abcdef0"}]`
3. **Use numeric values** for thresholds, periods, and evaluation periods
4. **Include all required fields** for the translator

### Using Exported CloudWatch Alarms

The translator now supports both manual JSON format and exported CloudWatch alarm format:

**Manual Format (lowercase field names):**
```json
{
  "alarmName": "HighCPUUtilization",
  "metricName": "CPUUtilization",
  "namespace": "AWS/EC2",
  "statistic": "Average",
  "period": 300,
  "threshold": 80.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**Exported Format (capitalized field names):**
```json
{
  "AlarmName": "HighCPUUtilization",
  "MetricName": "CPUUtilization",
  "Namespace": "AWS/EC2",
  "Statistic": "Average",
  "Period": 300,
  "Threshold": 80.0,
  "ComparisonOperator": "GreaterThanThreshold",
  "EvaluationPeriods": 2,
  "DatapointsToAlarm": 2,
  "Dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**To export an alarm from CloudWatch:**
```bash
aws cloudwatch describe-alarms --alarm-names "HighCPUUtilization" --output json
```

### Common Dimension Patterns

- **EC2**: `InstanceId`, `AutoScalingGroupName`
- **RDS**: `DBInstanceIdentifier`, `DatabaseClass`
- **ELB**: `LoadBalancerName`, `AvailabilityZone`
- **S3**: `BucketName`, `StorageType`
- **Lambda**: `FunctionName`, `Resource`
- **Logs**: `LogGroupName`, `DestinationType`

### Best Practices

1. **Use appropriate statistics**:
   - `Average` for rates and percentages
   - `Sum` for counts and totals
   - `Maximum` for peak values
   - `Minimum` for minimum thresholds

2. **Set reasonable evaluation periods**:
   - Use 1-2 periods for critical alerts
   - Use 3-5 periods for less critical alerts
   - Consider the metric's volatility

3. **Choose appropriate thresholds**:
   - Base thresholds on historical data
   - Consider business impact
   - Account for normal variations

4. **Use meaningful alarm names**:
   - Include service and metric information
   - Use consistent naming conventions
   - Make names descriptive but concise
