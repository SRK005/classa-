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
  assignment: {
    marginBottom: 20,
    padding: 15,
    border: '1 solid #ddd',
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assignmentText: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 20,
    fontSize: 10,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionItem: {
    marginBottom: 3,
  },
  dueDate: {
    backgroundColor: '#fff3cd',
    padding: 10,
    marginBottom: 20,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rubric: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    marginTop: 15,
    fontSize: 10,
  },
  rubricTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskContainer: {
    marginBottom: 15,
  },
  answerLine: {
    fontSize: 10,
    color: '#999',
  },
  answerLineWithMargin: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
});

interface HomeworkPDFProps {
  // Props can be added here for dynamic content
}

const HomeworkPDF: React.FC<HomeworkPDFProps> = () => {
  const homeworkData = {
    title: 'Science Homework Assignment',
    class: '8th Grade',
    subject: 'Physics - Light and Sound',
    dueDate: 'Friday, December 15, 2024',
    totalPoints: '25 points',
    estimatedTime: '45 minutes',
    instructions: [
      'Complete all questions in your own words',
      'Show diagrams where applicable',
      'Submit your work in neat handwriting',
      'Include references if you use external sources'
    ],
    assignments: [
      {
        title: 'Conceptual Questions',
        tasks: [
          'Explain the difference between reflection and refraction of light with examples.',
          'Draw a labeled diagram showing how sound waves travel through different mediums.',
          'Describe three practical applications of the laws of reflection in daily life.'
        ]
      },
      {
        title: 'Problem Solving',
        tasks: [
          'Calculate the speed of sound in air at 20°C. Show your working.',
          'A light ray hits a mirror at 30° angle. What will be the angle of reflection?',
          'Explain why we see lightning before hearing thunder during a storm.'
        ]
      },
      {
        title: 'Research Activity',
        tasks: [
          'Research and write a short paragraph about how fiber optic cables use light for communication.',
          'Find one example of how animals use sound for navigation or communication.'
        ]
      }
    ],
    rubric: [
      'Accuracy of scientific concepts (40%)',
      'Quality of explanations and examples (30%)',
      'Neatness and organization (20%)',
      'Completion of all tasks (10%)'
    ]
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{homeworkData.title}</Text>
          <Text style={styles.subtitle}>Class: {homeworkData.class} | Subject: {homeworkData.subject}</Text>
          <Text style={styles.subtitle}>Estimated Time: {homeworkData.estimatedTime} | Total Points: {homeworkData.totalPoints}</Text>
        </View>

        {/* Due Date */}
        <View style={styles.dueDate}>
          <Text>📅 Due Date: {homeworkData.dueDate}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          {homeworkData.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionItem}>• {instruction}</Text>
          ))}
        </View>

        {/* Assignments */}
        {homeworkData.assignments.map((assignment, assignmentIndex) => (
          <View key={assignmentIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{assignment.title}</Text>
            
            <View style={styles.assignment}>
              {assignment.tasks.map((task, taskIndex) => (
                <View key={taskIndex} style={styles.taskContainer}>
                  <Text style={styles.assignmentText}>{task}</Text>
                  <Text style={styles.answerLineWithMargin}>_________________________________________________</Text>
                  <Text style={styles.answerLine}>_________________________________________________</Text>
                  <Text style={styles.answerLine}>_________________________________________________</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Grading Rubric */}
        <View style={styles.rubric}>
          <Text style={styles.rubricTitle}>Grading Rubric:</Text>
          {homeworkData.rubric.map((criterion, index) => (
            <Text key={index} style={styles.instructionItem}>• {criterion}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default HomeworkPDF;