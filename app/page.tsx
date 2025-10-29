'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

type Cell = number | null
type Board = Cell[][]

const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard'): { puzzle: Board; solution: Board } => {
  const solution: Board = Array(9).fill(null).map(() => Array(9).fill(null))

  const isValid = (board: Board, row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) return false
    }

    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false
      }
    }
    return true
  }

  const solve = (board: Board): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
          for (const num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num
              if (solve(board)) return true
              board[row][col] = null
            }
          }
          return false
        }
      }
    }
    return true
  }

  solve(solution)

  const puzzle: Board = solution.map(row => [...row])
  const cellsToRemove = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 45 : 55

  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null
      removed++
    }
  }

  return { puzzle, solution }
}

export default function Home() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [board, setBoard] = useState<Board>([])
  const [initialBoard, setInitialBoard] = useState<Board>([])
  const [solution, setSolution] = useState<Board>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [showMenu, setShowMenu] = useState(true)

  const startNewGame = (diff: 'easy' | 'medium' | 'hard') => {
    const { puzzle, solution: sol } = generateSudoku(diff)
    setBoard(puzzle)
    setInitialBoard(puzzle.map(row => [...row]))
    setSolution(sol)
    setSelectedCell(null)
    setErrors(new Set())
    setIsComplete(false)
    setDifficulty(diff)
    setShowMenu(false)
  }

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === null && !isComplete) {
      setSelectedCell([row, col])
    }
  }

  const handleNumberClick = (num: number) => {
    if (selectedCell && !isComplete) {
      const [row, col] = selectedCell
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = num
      setBoard(newBoard)

      if (num !== solution[row][col]) {
        const key = `${row}-${col}`
        setErrors(new Set(errors).add(key))
      } else {
        const key = `${row}-${col}`
        const newErrors = new Set(errors)
        newErrors.delete(key)
        setErrors(newErrors)

        const isGameComplete = newBoard.every((row, i) =>
          row.every((cell, j) => cell === solution[i][j])
        )
        if (isGameComplete) {
          setIsComplete(true)
        }
      }
    }
  }

  const handleClear = () => {
    if (selectedCell && !isComplete) {
      const [row, col] = selectedCell
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = null
      setBoard(newBoard)

      const key = `${row}-${col}`
      const newErrors = new Set(errors)
      newErrors.delete(key)
      setErrors(newErrors)
    }
  }

  if (showMenu) {
    return (
      <div className={styles.menu}>
        <h1 className={styles.title}>سودوكو</h1>
        <p className={styles.subtitle}>اختر مستوى الصعوبة</p>
        <div className={styles.menuButtons}>
          <button className={styles.menuButton} onClick={() => startNewGame('easy')}>
            سهل
          </button>
          <button className={styles.menuButton} onClick={() => startNewGame('medium')}>
            متوسط
          </button>
          <button className={styles.menuButton} onClick={() => startNewGame('hard')}>
            صعب
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>سودوكو</h1>
        <button className={styles.newGameButton} onClick={() => setShowMenu(true)}>
          لعبة جديدة
        </button>
      </div>

      {isComplete && (
        <div className={styles.complete}>
          🎉 مبروك! أكملت اللعبة 🎉
        </div>
      )}

      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, colIndex) => {
              const isInitial = initialBoard[rowIndex][colIndex] !== null
              const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
              const hasError = errors.has(`${rowIndex}-${colIndex}`)

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${isInitial ? styles.initial : ''} ${
                    isSelected ? styles.selected : ''
                  } ${hasError ? styles.error : ''} ${
                    colIndex % 3 === 2 && colIndex !== 8 ? styles.rightBorder : ''
                  } ${rowIndex % 3 === 2 && rowIndex !== 8 ? styles.bottomBorder : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell || ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={styles.numberButton}
            onClick={() => handleNumberClick(num)}
            disabled={!selectedCell || isComplete}
          >
            {num}
          </button>
        ))}
        <button
          className={`${styles.numberButton} ${styles.clearButton}`}
          onClick={handleClear}
          disabled={!selectedCell || isComplete}
        >
          مسح
        </button>
      </div>
    </div>
  )
}
