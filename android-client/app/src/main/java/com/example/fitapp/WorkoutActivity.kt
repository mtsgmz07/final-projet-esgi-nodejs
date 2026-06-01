package com.example.fitapp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class WorkoutActivity : AppCompatActivity() {

    private var seconds = 0
    private var isRunning = false
    private var exerciseIndex = 0

    private val exercises = listOf(
        "Squat",
        "Pompes",
        "Gainage",
        "Fentes"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_workout)

        val tvExerciseName = findViewById<TextView>(R.id.tvExerciseName)
        val tvTimer = findViewById<TextView>(R.id.tvTimer)
        val btnStartTimer = findViewById<Button>(R.id.btnStartTimer)
        val btnNextExercise = findViewById<Button>(R.id.btnNextExercise)

        val handler = Handler(Looper.getMainLooper())

        val runnable = object : Runnable {
            override fun run() {
                if (isRunning) {
                    seconds++
                    val minutes = seconds / 60
                    val remainingSeconds = seconds % 60
                    tvTimer.text = String.format("%02d:%02d", minutes, remainingSeconds)
                }
                handler.postDelayed(this, 1000)
            }
        }

        handler.post(runnable)

        btnStartTimer.setOnClickListener {
            isRunning = !isRunning
            btnStartTimer.text = if (isRunning) "Pause" else "Reprendre"
        }

        btnNextExercise.setOnClickListener {
            exerciseIndex++

            if (exerciseIndex < exercises.size) {
                tvExerciseName.text = "Exercice : ${exercises[exerciseIndex]}"
                seconds = 0
                tvTimer.text = "00:00"
            } else {
                startActivity(Intent(this, ReviewActivity::class.java))
                finish()
            }
        }
    }
}