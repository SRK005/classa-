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
  question: {
    marginBottom: 20,
    padding: 10,
    border: '1 solid #ddd',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  option: {
    fontSize: 10,
    marginLeft: 15,
    marginBottom: 3,
  },
  answerKey: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    marginTop: 8,
    fontSize: 10,
    fontStyle: 'italic',
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
});

interface Question {
  number: number;
  text: string;
  options?: string[];
  answer: string;
}

interface Section {
  title: string;
  questions: Question[];
}

interface WorksheetPDFProps {
  showAnswers: boolean;
}

const WorksheetPDF: React.FC<WorksheetPDFProps> = ({ showAnswers }) => {
  const worksheetData = {
    title: 'Mathematics Worksheet',
    class: '8th Grade',
    subject: 'Algebraic Expressions',
    timeLimit: '45 minutes',
    totalMarks: '50 marks',
    instructions: [
      'Answer all questions in the space provided',
      'Show your working for all calculations',
      'Use proper mathematical notation',
      'Total marks: 50'
    ],
    sections: [
      {
        title: 'Section A: Multiple Choice Questions (10 marks)',
        questions: [
          {
            number: 1,
            text: 'What is the coefficient of x² in the expression 3x² + 5x - 7? (2 marks)',
            options: ['a) 3', 'b) 5', 'c) -7', 'd) 2'],
            answer: 'a) 3'
          },
          {
            number: 2,
            text: 'Simplify: 2x + 3x - x',
            options: ['a) 4x', 'b) 5x', 'c) 6x', 'd) 3x'],
            answer: 'a) 4x'
          }
        ]
      },
      {
        title: 'Section B: Short Answer Questions (20 marks)',
        questions: [
          {
            number: 3,
            text: 'Add the following algebraic expressions: (3x² + 2x - 5) + (x² - 4x + 3)',
            answer: '(3x² + 2x - 5) + (x² - 4x + 3) = 4x² - 2x - 2'
          },
          {
            number: 4,
            text: 'Find the value of the expression 2x + 3y when x = 4 and y = 2',
            answer: '2x + 3y = 2(4) + 3(2) = 8 + 6 = 14'
          }
        ]
      },
      {
        title: 'Section C: Long Answer Questions (20 marks)',
        questions: [
          {
            number: 5,
            text: 'A rectangle has length (3x + 2) units and breadth (2x - 1) units.\na) Find the expression for the perimeter of the rectangle. (5 marks)\nb) Find the expression for the area of the rectangle. (5 marks)\nc) If x = 3, calculate the actual perimeter and area. (5 marks)',
            answer: 'a) Perimeter = 2(length + breadth) = 2[(3x + 2) + (2x - 1)] = 2(5x + 1) = 10x + 2\nb) Area = length × breadth = (3x + 2)(2x - 1) = 6x² - 3x + 4x - 2 = 6x² + x - 2\nc) When x = 3: Perimeter = 10(3) + 2 = 32 units, Area = 6(9) + 3 - 2 = 55 square units'
          },
          {
            number: 6,
            text: 'Factorize the following expressions: (5 marks)\na) 6x² + 9x\nb) x² - 4',
            answer: 'a) 6x² + 9x = 3x(2x + 3)\nb) x² - 4 = (x + 2)(x - 2)'
          }
        ]
      }
    ]
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{worksheetData.title}</Text>
          <Text style={styles.subtitle}>Class: {worksheetData.class} | Subject: {worksheetData.subject}</Text>
          <Text style={styles.subtitle}>Time: {worksheetData.timeLimit} | Total Marks: {worksheetData.totalMarks}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          {worksheetData.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionItem}>• {instruction}</Text>
          ))}
        </View>

        {/* Sections */}
        {worksheetData.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.questions.map((question, questionIndex) => (
              <View key={questionIndex} style={styles.question}>
                <Text style={styles.questionNumber}>{question.number}. </Text>
                <Text style={styles.questionText}>{question.text}</Text>
                
                {'options' in question && question.options && question.options.map((option: string, optionIndex: number) => (
                  <Text key={optionIndex} style={styles.option}>{option}</Text>
                ))}
                
                {showAnswers && question.answer && (
                  <View style={styles.answerKey}>
                    <Text>Answer: {question.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default WorksheetPDF;