import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'Times-Roman',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #000',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  metricCard: {
    border: '1 solid #ddd',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  metricDescription: {
    fontSize: 10,
    color: '#666',
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1 solid #eee',
  },
  itemLabel: {
    fontSize: 11,
    flex: 1,
  },
  itemValue: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
  },
  summary: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginTop: 20,
    fontSize: 11,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendation: {
    backgroundColor: '#fff3cd',
    padding: 15,
    marginTop: 15,
    fontSize: 11,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  listItem: {
    fontSize: 10,
    marginBottom: 3,
  },
});

interface PerformancePDFProps {
  studentName?: string;
}

const PerformancePDF: React.FC<PerformancePDFProps> = ({ studentName = 'Student' }) => {
  const performanceData = {
    title: 'Academic Performance Report',
    student: studentName,
    class: '10th Grade',
    reportPeriod: 'Quarter 2, 2024',
    generatedDate: new Date().toLocaleDateString(),
    overallMetrics: {
      overallGrade: 'A-',
      gpa: '3.7',
      attendance: '94%',
      assignmentsCompleted: '87%'
    },
    subjectPerformance: [
      { subject: 'Mathematics', grade: 'A', score: '92%', trend: '↑ +5%' },
      { subject: 'Science', grade: 'A-', score: '88%', trend: '↑ +3%' },
      { subject: 'English', grade: 'B+', score: '85%', trend: '→ 0%' },
      { subject: 'History', grade: 'A', score: '91%', trend: '↑ +7%' },
      { subject: 'Art', grade: 'A-', score: '89%', trend: '↑ +2%' }
    ],
    skillsAssessment: [
      { skill: 'Problem Solving', level: 'Advanced', score: '90%' },
      { skill: 'Critical Thinking', level: 'Proficient', score: '85%' },
      { skill: 'Communication', level: 'Proficient', score: '82%' },
      { skill: 'Collaboration', level: 'Advanced', score: '93%' },
      { skill: 'Creativity', level: 'Proficient', score: '87%' }
    ],
    strengths: [
      'Excellent mathematical reasoning and problem-solving abilities',
      'Strong collaborative skills and teamwork',
      'Consistent improvement in scientific inquiry methods',
      'Good attendance and punctuality'
    ],
    areasForImprovement: [
      'Focus on improving written communication skills',
      'Increase participation in class discussions',
      'Work on time management for assignments',
      'Develop more creative approaches to projects'
    ],
    recommendations: [
      'Consider advanced mathematics courses for next semester',
      'Join the science club to further develop research skills',
      'Practice public speaking through debate club participation',
      'Set up regular study schedule to improve consistency'
    ]
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{performanceData.title}</Text>
          <Text style={styles.subtitle}>Student: {performanceData.student} | Class: {performanceData.class}</Text>
          <Text style={styles.subtitle}>Report Period: {performanceData.reportPeriod} | Generated: {performanceData.generatedDate}</Text>
        </View>

        {/* Overall Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance Metrics</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Overall Grade</Text>
                <Text style={styles.metricValue}>{performanceData.overallMetrics.overallGrade}</Text>
                <Text style={styles.metricDescription}>Current academic standing</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Attendance Rate</Text>
                <Text style={styles.metricValue}>{performanceData.overallMetrics.attendance}</Text>
                <Text style={styles.metricDescription}>Class attendance percentage</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>GPA</Text>
                <Text style={styles.metricValue}>{performanceData.overallMetrics.gpa}</Text>
                <Text style={styles.metricDescription}>Grade Point Average</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Assignments Completed</Text>
                <Text style={styles.metricValue}>{performanceData.overallMetrics.assignmentsCompleted}</Text>
                <Text style={styles.metricDescription}>Assignment completion rate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          {performanceData.subjectPerformance.map((subject, index) => (
            <View key={index} style={styles.performanceItem}>
              <Text style={styles.itemLabel}>{subject.subject}</Text>
              <Text style={styles.itemValue}>{subject.grade} ({subject.score})</Text>
            </View>
          ))}
        </View>

        {/* Skills Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Assessment</Text>
          {performanceData.skillsAssessment.map((skill, index) => (
            <View key={index} style={styles.performanceItem}>
              <Text style={styles.itemLabel}>{skill.skill}</Text>
              <Text style={styles.itemValue}>{skill.level} ({skill.score})</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Strengths</Text>
          {performanceData.strengths.map((strength, index) => (
            <Text key={index} style={styles.listItem}>• {strength}</Text>
          ))}
        </View>

        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>Areas for Improvement</Text>
          {performanceData.areasForImprovement.map((area, index) => (
            <Text key={index} style={styles.listItem}>• {area}</Text>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Recommendations</Text>
          {performanceData.recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.listItem}>• {recommendation}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PerformancePDF;